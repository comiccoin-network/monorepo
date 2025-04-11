// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/service/user/get.go
package user

import (
	"errors"
	"fmt"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config/constants"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/user"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/usecase/user"
)

// GetUserService defines the interface for getting user details
type GetUserService interface {
	ExecuteByID(sessCtx mongo.SessionContext, userID primitive.ObjectID) (*UserResponseDTO, error)
	ExecuteByEmail(sessCtx mongo.SessionContext, email string) (*UserResponseDTO, error)
}

// getUserServiceImpl implements the GetUserService interface
type getUserServiceImpl struct {
	config                *config.Configuration
	logger                *slog.Logger
	userGetByIDUseCase    uc_user.UserGetByIDUseCase
	userGetByEmailUseCase uc_user.UserGetByEmailUseCase
}

// NewGetUserService creates a new instance of GetUserService
func NewGetUserService(
	config *config.Configuration,
	logger *slog.Logger,
	userGetByIDUseCase uc_user.UserGetByIDUseCase,
	userGetByEmailUseCase uc_user.UserGetByEmailUseCase,
) GetUserService {
	return &getUserServiceImpl{
		config:                config,
		logger:                logger,
		userGetByIDUseCase:    userGetByIDUseCase,
		userGetByEmailUseCase: userGetByEmailUseCase,
	}
}

// ExecuteByID retrieves a user by their ID
func (svc *getUserServiceImpl) ExecuteByID(sessCtx mongo.SessionContext, userID primitive.ObjectID) (*UserResponseDTO, error) {
	//
	// Extract authenticated user information from context.
	//

	// sessionUserID, ok := sessCtx.Value(constants.SessionUserID).(primitive.ObjectID)
	// if !ok {
	// 	svc.logger.Error("Failed getting local user id",
	// 		slog.Any("error", "Not found in context: user_id"))
	// 	return nil, errors.New("user id not found in context")
	// }
	sessionUserRole, _ := sessCtx.Value(constants.SessionUserRole).(int8)
	if sessionUserRole != user.UserRoleRoot {
		svc.logger.Error("Wrong user permission",
			slog.Any("role", sessionUserRole),
			slog.Any("error", "User is not root"))
		return nil, errors.New("user is not administration")
	}

	//
	// Santize and validate input fields.
	//

	// Validate userID
	if userID.IsZero() {
		return nil, httperror.NewForBadRequestWithSingleField("id", "User ID is required")
	}

	//
	// Get user from database
	//

	user, err := svc.userGetByIDUseCase.Execute(sessCtx, userID)
	if err != nil {
		svc.logger.Error("Failed to get user by ID",
			slog.String("user_id", userID.Hex()),
			slog.Any("error", err))
		return nil, err
	}

	if user == nil {
		return nil, httperror.NewForNotFoundWithSingleField("message", fmt.Sprintf("User with ID %s not found", userID.Hex()))
	}

	// Transform to response DTO
	return &UserResponseDTO{
		ID:                        user.ID,
		Email:                     user.Email,
		FirstName:                 user.FirstName,
		LastName:                  user.LastName,
		Name:                      user.Name,
		LexicalName:               user.LexicalName,
		Role:                      user.Role,
		Phone:                     user.Phone,
		Country:                   user.Country,
		Timezone:                  user.Timezone,
		Region:                    user.Region,
		City:                      user.City,
		PostalCode:                user.PostalCode,
		AddressLine1:              user.AddressLine1,
		AddressLine2:              user.AddressLine2,
		WalletAddress:             user.WalletAddress,
		WasEmailVerified:          user.WasEmailVerified,
		ProfileVerificationStatus: user.ProfileVerificationStatus,
		WebsiteURL:                user.WebsiteURL,
		Description:               user.Description,
		ComicBookStoreName:        user.ComicBookStoreName,
		CreatedAt:                 user.CreatedAt,
		ModifiedAt:                user.ModifiedAt,
		Status:                    user.Status,
		ChainID:                   user.ChainID,
		AgreeTermsOfService:       user.AgreeTermsOfService,
		AgreePromotions:           user.AgreePromotions,
		AgreeToTrackingAcrossThirdPartyAppsAndServices: user.AgreeToTrackingAcrossThirdPartyAppsAndServices,
	}, nil
}

// ExecuteByEmail retrieves a user by their email address
func (svc *getUserServiceImpl) ExecuteByEmail(sessCtx mongo.SessionContext, email string) (*UserResponseDTO, error) {
	//
	// Extract authenticated user information from context.
	//

	sessionUserRole, _ := sessCtx.Value(constants.SessionUserRole).(int8)
	if sessionUserRole != user.UserRoleRoot {
		svc.logger.Error("Wrong user permission",
			slog.Any("error", "User is not root"))
		return nil, errors.New("user is not administration")
	}

	//
	// Santize and validate input fields.
	//

	// Validate userID
	if email == "" {
		return nil, httperror.NewForBadRequestWithSingleField("email", "User email is required")
	}

	//
	// Get user from database
	//

	user, err := svc.userGetByEmailUseCase.Execute(sessCtx, email)
	if err != nil {
		svc.logger.Error("Failed to get user by email",
			slog.String("email", email),
			slog.Any("error", err))
		return nil, err
	}

	if user == nil {
		return nil, httperror.NewForNotFoundWithSingleField("message", fmt.Sprintf("User with email %s not found", email))
	}

	// Transform to response DTO
	return &UserResponseDTO{
		ID:                        user.ID,
		Email:                     user.Email,
		FirstName:                 user.FirstName,
		LastName:                  user.LastName,
		Name:                      user.Name,
		LexicalName:               user.LexicalName,
		Role:                      user.Role,
		Phone:                     user.Phone,
		Country:                   user.Country,
		Timezone:                  user.Timezone,
		Region:                    user.Region,
		City:                      user.City,
		PostalCode:                user.PostalCode,
		AddressLine1:              user.AddressLine1,
		AddressLine2:              user.AddressLine2,
		WalletAddress:             user.WalletAddress,
		WasEmailVerified:          user.WasEmailVerified,
		ProfileVerificationStatus: user.ProfileVerificationStatus,
		WebsiteURL:                user.WebsiteURL,
		Description:               user.Description,
		ComicBookStoreName:        user.ComicBookStoreName,
		CreatedAt:                 user.CreatedAt,
		ModifiedAt:                user.ModifiedAt,
		Status:                    user.Status,
		ChainID:                   user.ChainID,
		AgreeTermsOfService:       user.AgreeTermsOfService,
		AgreePromotions:           user.AgreePromotions,
		AgreeToTrackingAcrossThirdPartyAppsAndServices: user.AgreeToTrackingAcrossThirdPartyAppsAndServices,
	}, nil
}
