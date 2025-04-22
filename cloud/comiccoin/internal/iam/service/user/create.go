// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/service/user/create.go
package user

import (
	"errors"
	"fmt"
	"log/slog"
	"strings"
	"time"

	"github.com/ethereum/go-ethereum/common"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config/constants"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/password"
	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/securestring"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/user"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/usecase/user"
)

// CreateUserService defines the interface for user creation service
type CreateUserService interface {
	Execute(sessCtx mongo.SessionContext, req *CreateUserRequestDTO) (*UserResponseDTO, error)
}

// createUserServiceImpl implements the CreateUserService interface
type createUserServiceImpl struct {
	config                *config.Configuration
	logger                *slog.Logger
	passwordProvider      password.Provider
	userGetByEmailUseCase uc_user.UserGetByEmailUseCase
	userCreateUseCase     uc_user.UserCreateUseCase
}

// NewCreateUserService creates a new instance of CreateUserService
func NewCreateUserService(
	config *config.Configuration,
	logger *slog.Logger,
	passwordProvider password.Provider,
	userGetByEmailUseCase uc_user.UserGetByEmailUseCase,
	userCreateUseCase uc_user.UserCreateUseCase,
) CreateUserService {
	return &createUserServiceImpl{
		config:                config,
		logger:                logger,
		passwordProvider:      passwordProvider,
		userGetByEmailUseCase: userGetByEmailUseCase,
		userCreateUseCase:     userCreateUseCase,
	}
}

// Execute processes the request to create a new user
func (svc *createUserServiceImpl) Execute(sessCtx mongo.SessionContext, req *CreateUserRequestDTO) (*UserResponseDTO, error) {
	//
	// Extract authenticated user information from context.
	//

	userID, ok := sessCtx.Value(constants.SessionUserID).(primitive.ObjectID)
	if !ok {
		svc.logger.Error("Failed getting local user id",
			slog.Any("error", "Not found in context: user_id"))
		return nil, errors.New("user id not found in context")
	}
	userName, _ := sessCtx.Value(constants.SessionUserName).(string)
	userRole, _ := sessCtx.Value(constants.SessionUserRole).(int8)
	if userRole != user.UserRoleRoot {
		svc.logger.Error("Wrong user permission",
			slog.Any("error", "User is not root"))
		return nil, errors.New("user is not administration")
	}

	userIPAddress := sessCtx.Value(constants.SessionIPAddress).(string)

	//
	// Santize and validate input fields.
	//

	// Defensive Code: For security purposes we need to remove all whitespaces from the email and lower the characters.
	req.Email = strings.ToLower(req.Email)
	req.Email = strings.ReplaceAll(req.Email, " ", "")

	e := make(map[string]string)

	if req.Email == "" {
		e["email"] = "Email is required"
	}

	if req.FirstName == "" {
		e["first_name"] = "First name is required"
	}

	if req.LastName == "" {
		e["last_name"] = "Last name is required"
	}

	if req.Password == "" {
		e["password"] = "Password is required"
	}

	if req.Timezone == "" {
		e["timezone"] = "Timezone is required"
	}

	if req.Role != user.UserRoleRoot && req.Role != user.UserRoleCompany && req.Role != user.UserRoleIndividual {
		e["role"] = "Invalid role - must be 1 (Admin), 2 (Company), or 3 (Individual)"
	}

	if !req.AgreeTermsOfService {
		e["agree_terms_of_service"] = "User must agree to terms of service"
	}

	if len(e) != 0 {
		svc.logger.Warn("User creation validation failed", slog.Any("errors", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	// Check if user with this email already exists
	existingUser, err := svc.userGetByEmailUseCase.Execute(sessCtx, req.Email)
	if err != nil {
		svc.logger.Error("Error checking for existing user", slog.Any("error", err))
		return nil, err
	}

	if existingUser != nil {
		return nil, httperror.NewForBadRequestWithSingleField("email", "A user with this email already exists")
	}

	// Create secure password and hash it
	securePassword, err := sstring.NewSecureString(req.Password)
	if err != nil {
		svc.logger.Error("Failed to create secure password", slog.Any("error", err))
		return nil, err
	}
	defer securePassword.Wipe()

	passwordHash, err := svc.passwordProvider.GenerateHashFromPassword(securePassword)
	if err != nil {
		svc.logger.Error("Failed to hash password", slog.Any("error", err))
		return nil, err
	}

	// Process wallet address if provided
	var walletAddress *common.Address
	if req.WalletAddress != "" {
		addr := common.HexToAddress(req.WalletAddress)
		walletAddress = &addr
	}

	//
	// Create in database.
	//

	// Create new user ID
	newUserID := primitive.NewObjectID()

	// Prepare user domain object
	newUser := &user.User{
		ID:                    newUserID,
		Email:                 req.Email,
		FirstName:             req.FirstName,
		LastName:              req.LastName,
		Name:                  fmt.Sprintf("%s %s", req.FirstName, req.LastName),
		LexicalName:           fmt.Sprintf("%s, %s", req.LastName, req.FirstName),
		PasswordHash:          passwordHash,
		PasswordHashAlgorithm: svc.passwordProvider.AlgorithmName(),
		Role:                  req.Role,
		Phone:                 req.Phone,
		Country:               req.Country,
		Timezone:              req.Timezone,
		Region:                req.Region,
		City:                  req.City,
		PostalCode:            req.PostalCode,
		AddressLine1:          req.AddressLine1,
		AddressLine2:          req.AddressLine2,
		AgreeTermsOfService:   req.AgreeTermsOfService,
		AgreePromotions:       req.AgreePromotions,
		AgreeToTrackingAcrossThirdPartyAppsAndServices: req.AgreeToTrackingAcrossThirdPartyAppsAndServices,
		CreatedByUserID:           userID,
		CreatedAt:                 time.Now(),
		CreatedByName:             userName,
		CreatedFromIPAddress:      userIPAddress,
		ModifiedByUserID:          userID,
		ModifiedAt:                time.Now(),
		ModifiedByName:            userName,
		ModifiedFromIPAddress:     userIPAddress,
		WasEmailVerified:          req.IsEmailVerified,
		Status:                    user.UserStatusActive, // Default to active status
		ChainID:                   svc.config.Blockchain.ChainID,
		WalletAddress:             walletAddress,
		ProfileVerificationStatus: req.ProfileVerificationStatus,
		WebsiteURL:                req.WebsiteURL,
		Description:               req.Description,
		ComicBookStoreName:        req.ComicBookStoreName,
	}

	// Save to database
	err = svc.userCreateUseCase.Execute(sessCtx, newUser)
	if err != nil {
		svc.logger.Error("Failed to create user", slog.Any("error", err))
		return nil, err
	}

	svc.logger.Info("Admin created new user",
		slog.String("admin_id", userID.Hex()),
		slog.String("created_user_id", newUser.ID.Hex()),
		slog.String("email", newUser.Email),
		slog.Int("role", int(newUser.Role)))

	// Return user response
	return &UserResponseDTO{
		ID:                        newUser.ID,
		Email:                     newUser.Email,
		FirstName:                 newUser.FirstName,
		LastName:                  newUser.LastName,
		Name:                      newUser.Name,
		LexicalName:               newUser.LexicalName,
		Role:                      newUser.Role,
		Phone:                     newUser.Phone,
		Country:                   newUser.Country,
		Timezone:                  newUser.Timezone,
		Region:                    newUser.Region,
		City:                      newUser.City,
		PostalCode:                newUser.PostalCode,
		AddressLine1:              newUser.AddressLine1,
		AddressLine2:              newUser.AddressLine2,
		WalletAddress:             newUser.WalletAddress,
		WasEmailVerified:          newUser.WasEmailVerified,
		ProfileVerificationStatus: newUser.ProfileVerificationStatus,
		WebsiteURL:                newUser.WebsiteURL,
		Description:               newUser.Description,
		ComicBookStoreName:        newUser.ComicBookStoreName,
		CreatedAt:                 newUser.CreatedAt,
		ModifiedAt:                newUser.ModifiedAt,
		Status:                    newUser.Status,
		ChainID:                   newUser.ChainID,
		AgreeTermsOfService:       newUser.AgreeTermsOfService,
		AgreePromotions:           newUser.AgreePromotions,
		AgreeToTrackingAcrossThirdPartyAppsAndServices: newUser.AgreeToTrackingAcrossThirdPartyAppsAndServices,
	}, nil
}
