// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/service/user/create.go
package user

import (
	"fmt"
	"log/slog"
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
func (s *createUserServiceImpl) Execute(sessCtx mongo.SessionContext, req *CreateUserRequestDTO) (*UserResponseDTO, error) {
	// Validate request
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
		s.logger.Warn("User creation validation failed", slog.Any("errors", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	// Check if user with this email already exists
	existingUser, err := s.userGetByEmailUseCase.Execute(sessCtx, req.Email)
	if err != nil {
		s.logger.Error("Error checking for existing user", slog.Any("error", err))
		return nil, err
	}

	if existingUser != nil {
		return nil, httperror.NewForBadRequestWithSingleField("email", "A user with this email already exists")
	}

	// Get admin user info from context for auditing
	adminUser, ok := sessCtx.Value(constants.SessionUser).(*user.User)
	if !ok || adminUser == nil {
		s.logger.Error("Admin user not found in context")
		return nil, httperror.NewForForbiddenWithSingleField("message", "Admin user not found")
	}

	// Create secure password and hash it
	securePassword, err := sstring.NewSecureString(req.Password)
	if err != nil {
		s.logger.Error("Failed to create secure password", slog.Any("error", err))
		return nil, err
	}

	passwordHash, err := s.passwordProvider.GenerateHashFromPassword(securePassword)
	if err != nil {
		s.logger.Error("Failed to hash password", slog.Any("error", err))
		return nil, err
	}

	// Process wallet address if provided
	var walletAddress *common.Address
	if req.WalletAddress != "" {
		addr := common.HexToAddress(req.WalletAddress)
		walletAddress = &addr
	}

	// Create new user ID
	userID := primitive.NewObjectID()

	// Prepare user domain object
	newUser := &user.User{
		ID:                    userID,
		Email:                 req.Email,
		FirstName:             req.FirstName,
		LastName:              req.LastName,
		Name:                  fmt.Sprintf("%s %s", req.FirstName, req.LastName),
		LexicalName:           fmt.Sprintf("%s, %s", req.LastName, req.FirstName),
		PasswordHash:          passwordHash,
		PasswordHashAlgorithm: s.passwordProvider.AlgorithmName(),
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
		CreatedByUserID:           adminUser.ID,
		CreatedAt:                 time.Now(),
		CreatedByName:             adminUser.Name,
		CreatedFromIPAddress:      "API", // Using API as the source
		ModifiedByUserID:          adminUser.ID,
		ModifiedAt:                time.Now(),
		ModifiedByName:            adminUser.Name,
		ModifiedFromIPAddress:     "API",
		WasEmailVerified:          req.IsEmailVerified,
		Status:                    user.UserStatusActive, // Default to active status
		ChainID:                   s.config.Blockchain.ChainID,
		WalletAddress:             walletAddress,
		ProfileVerificationStatus: req.ProfileVerificationStatus,
		WebsiteURL:                req.WebsiteURL,
		Description:               req.Description,
		ComicBookStoreName:        req.ComicBookStoreName,
	}

	// Save to database
	err = s.userCreateUseCase.Execute(sessCtx, newUser)
	if err != nil {
		s.logger.Error("Failed to create user", slog.Any("error", err))
		return nil, err
	}

	s.logger.Info("Admin created new user",
		slog.String("admin_id", adminUser.ID.Hex()),
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
