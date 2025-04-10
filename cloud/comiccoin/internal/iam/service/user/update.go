// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/service/user/update.go
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

// UpdateUserService defines the interface for updating user details
type UpdateUserService interface {
	Execute(sessCtx mongo.SessionContext, userID primitive.ObjectID, req *UpdateUserRequestDTO) (*UserResponseDTO, error)
}

// updateUserServiceImpl implements the UpdateUserService interface
type updateUserServiceImpl struct {
	config             *config.Configuration
	logger             *slog.Logger
	passwordProvider   password.Provider
	userGetByIDUseCase uc_user.UserGetByIDUseCase
	userUpdateUseCase  uc_user.UserUpdateUseCase
}

// NewUpdateUserService creates a new instance of UpdateUserService
func NewUpdateUserService(
	config *config.Configuration,
	logger *slog.Logger,
	passwordProvider password.Provider,
	userGetByIDUseCase uc_user.UserGetByIDUseCase,
	userUpdateUseCase uc_user.UserUpdateUseCase,
) UpdateUserService {
	return &updateUserServiceImpl{
		config:             config,
		logger:             logger,
		passwordProvider:   passwordProvider,
		userGetByIDUseCase: userGetByIDUseCase,
		userUpdateUseCase:  userUpdateUseCase,
	}
}

// Execute processes the request to update a user
func (s *updateUserServiceImpl) Execute(sessCtx mongo.SessionContext, userID primitive.ObjectID, req *UpdateUserRequestDTO) (*UserResponseDTO, error) {
	// Validate userID
	if userID.IsZero() {
		return nil, httperror.NewForBadRequestWithSingleField("id", "User ID is required")
	}

	// Get admin user info from context for auditing
	adminUser, ok := sessCtx.Value(constants.SessionUser).(*user.User)
	if !ok || adminUser == nil {
		s.logger.Error("Admin user not found in context")
		return nil, httperror.NewForForbiddenWithSingleField("message", "Admin user not found")
	}

	// Retrieve existing user
	existingUser, err := s.userGetByIDUseCase.Execute(sessCtx, userID)
	if err != nil {
		s.logger.Error("Failed to get user by ID",
			slog.String("user_id", userID.Hex()),
			slog.Any("error", err))
		return nil, err
	}

	if existingUser == nil {
		return nil, httperror.NewForNotFoundWithSingleField("message", fmt.Sprintf("User with ID %s not found", userID.Hex()))
	}

	// Update user fields if provided in request
	if req.Email != "" {
		existingUser.Email = req.Email
	}

	if req.FirstName != "" && req.LastName != "" {
		existingUser.FirstName = req.FirstName
		existingUser.LastName = req.LastName
		existingUser.Name = fmt.Sprintf("%s %s", req.FirstName, req.LastName)
		existingUser.LexicalName = fmt.Sprintf("%s, %s", req.LastName, req.FirstName)
	} else if req.FirstName != "" {
		existingUser.FirstName = req.FirstName
		existingUser.Name = fmt.Sprintf("%s %s", req.FirstName, existingUser.LastName)
	} else if req.LastName != "" {
		existingUser.LastName = req.LastName
		existingUser.Name = fmt.Sprintf("%s %s", existingUser.FirstName, req.LastName)
		existingUser.LexicalName = fmt.Sprintf("%s, %s", req.LastName, existingUser.FirstName)
	}

	// Handle password update if provided
	if req.Password != "" {
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

		existingUser.PasswordHash = passwordHash
		existingUser.PasswordHashAlgorithm = s.passwordProvider.AlgorithmName()
	}

	// Update role if specified
	if req.Role != 0 {
		if req.Role != user.UserRoleRoot && req.Role != user.UserRoleCompany && req.Role != user.UserRoleIndividual {
			return nil, httperror.NewForBadRequestWithSingleField("role", "Invalid role - must be 1 (Admin), 2 (Company), or 3 (Individual)")
		}
		existingUser.Role = req.Role
	}

	// Update contact info
	if req.Phone != "" {
		existingUser.Phone = req.Phone
	}

	if req.Country != "" {
		existingUser.Country = req.Country
	}

	if req.Timezone != "" {
		existingUser.Timezone = req.Timezone
	}

	if req.Region != "" {
		existingUser.Region = req.Region
	}

	if req.City != "" {
		existingUser.City = req.City
	}

	if req.PostalCode != "" {
		existingUser.PostalCode = req.PostalCode
	}

	if req.AddressLine1 != "" {
		existingUser.AddressLine1 = req.AddressLine1
	}

	if req.AddressLine2 != "" {
		existingUser.AddressLine2 = req.AddressLine2
	}

	// Update wallet address if provided
	if req.WalletAddress != "" {
		addr := common.HexToAddress(req.WalletAddress)
		existingUser.WalletAddress = &addr
	}

	// Update verification status if provided
	if req.IsEmailVerified != nil {
		existingUser.WasEmailVerified = *req.IsEmailVerified
	}

	if req.ProfileVerificationStatus != nil {
		existingUser.ProfileVerificationStatus = *req.ProfileVerificationStatus
	}

	// Update additional fields
	if req.WebsiteURL != "" {
		existingUser.WebsiteURL = req.WebsiteURL
	}

	if req.Description != "" {
		existingUser.Description = req.Description
	}

	if req.ComicBookStoreName != "" {
		existingUser.ComicBookStoreName = req.ComicBookStoreName
	}

	// Update status if provided
	if req.Status != nil {
		existingUser.Status = *req.Status
	}

	// Update preferences
	if req.AgreePromotions != nil {
		existingUser.AgreePromotions = *req.AgreePromotions
	}

	if req.AgreeToTrackingAcrossThirdPartyAppsAndServices != nil {
		existingUser.AgreeToTrackingAcrossThirdPartyAppsAndServices = *req.AgreeToTrackingAcrossThirdPartyAppsAndServices
	}

	// Update audit info
	existingUser.ModifiedByUserID = adminUser.ID
	existingUser.ModifiedAt = time.Now()
	existingUser.ModifiedByName = adminUser.Name
	existingUser.ModifiedFromIPAddress = "API" // Using API as the source

	// Save to database
	err = s.userUpdateUseCase.Execute(sessCtx, existingUser)
	if err != nil {
		s.logger.Error("Failed to update user",
			slog.String("user_id", userID.Hex()),
			slog.Any("error", err))
		return nil, err
	}

	s.logger.Info("Admin updated user",
		slog.String("admin_id", adminUser.ID.Hex()),
		slog.String("updated_user_id", existingUser.ID.Hex()),
		slog.String("email", existingUser.Email))

	// Return updated user
	return &UserResponseDTO{
		ID:                        existingUser.ID,
		Email:                     existingUser.Email,
		FirstName:                 existingUser.FirstName,
		LastName:                  existingUser.LastName,
		Name:                      existingUser.Name,
		LexicalName:               existingUser.LexicalName,
		Role:                      existingUser.Role,
		Phone:                     existingUser.Phone,
		Country:                   existingUser.Country,
		Timezone:                  existingUser.Timezone,
		Region:                    existingUser.Region,
		City:                      existingUser.City,
		PostalCode:                existingUser.PostalCode,
		AddressLine1:              existingUser.AddressLine1,
		AddressLine2:              existingUser.AddressLine2,
		WalletAddress:             existingUser.WalletAddress,
		WasEmailVerified:          existingUser.WasEmailVerified,
		ProfileVerificationStatus: existingUser.ProfileVerificationStatus,
		WebsiteURL:                existingUser.WebsiteURL,
		Description:               existingUser.Description,
		ComicBookStoreName:        existingUser.ComicBookStoreName,
		CreatedAt:                 existingUser.CreatedAt,
		ModifiedAt:                existingUser.ModifiedAt,
		Status:                    existingUser.Status,
		ChainID:                   existingUser.ChainID,
		AgreeTermsOfService:       existingUser.AgreeTermsOfService,
		AgreePromotions:           existingUser.AgreePromotions,
		AgreeToTrackingAcrossThirdPartyAppsAndServices: existingUser.AgreeToTrackingAcrossThirdPartyAppsAndServices,
	}, nil
}
