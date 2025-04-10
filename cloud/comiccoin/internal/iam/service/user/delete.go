// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/service/user/delete.go
package user

import (
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

// DeleteUserService defines the interface for deleting a user
type DeleteUserService interface {
	Execute(sessCtx mongo.SessionContext, userID primitive.ObjectID) error
}

// deleteUserServiceImpl implements the DeleteUserService interface
type deleteUserServiceImpl struct {
	config                *config.Configuration
	logger                *slog.Logger
	userGetByIDUseCase    uc_user.UserGetByIDUseCase
	userDeleteByIDUseCase uc_user.UserDeleteByIDUseCase
}

// NewDeleteUserService creates a new instance of DeleteUserService
func NewDeleteUserService(
	config *config.Configuration,
	logger *slog.Logger,
	userGetByIDUseCase uc_user.UserGetByIDUseCase,
	userDeleteByIDUseCase uc_user.UserDeleteByIDUseCase,
) DeleteUserService {
	return &deleteUserServiceImpl{
		config:                config,
		logger:                logger,
		userGetByIDUseCase:    userGetByIDUseCase,
		userDeleteByIDUseCase: userDeleteByIDUseCase,
	}
}

// Execute processes the request to delete a user
func (s *deleteUserServiceImpl) Execute(sessCtx mongo.SessionContext, userID primitive.ObjectID) error {
	// Validate userID
	if userID.IsZero() {
		return httperror.NewForBadRequestWithSingleField("id", "User ID is required")
	}

	// Get admin user info from context for auditing
	adminUser, ok := sessCtx.Value(constants.SessionUser).(*user.User)
	if !ok || adminUser == nil {
		s.logger.Error("Admin user not found in context")
		return httperror.NewForForbiddenWithSingleField("message", "Admin user not found")
	}

	// Verify user exists
	existingUser, err := s.userGetByIDUseCase.Execute(sessCtx, userID)
	if err != nil {
		s.logger.Error("Failed to get user by ID",
			slog.String("user_id", userID.Hex()),
			slog.Any("error", err))
		return err
	}

	if existingUser == nil {
		return httperror.NewForNotFoundWithSingleField("message", fmt.Sprintf("User with ID %s not found", userID.Hex()))
	}

	// Prevent admin from deleting themselves
	if existingUser.ID == adminUser.ID {
		return httperror.NewForBadRequestWithSingleField("message", "Cannot delete yourself")
	}

	// Delete from database
	err = s.userDeleteByIDUseCase.Execute(sessCtx, userID)
	if err != nil {
		s.logger.Error("Failed to delete user",
			slog.String("user_id", userID.Hex()),
			slog.Any("error", err))
		return err
	}

	s.logger.Info("Admin deleted user",
		slog.String("admin_id", adminUser.ID.Hex()),
		slog.String("deleted_user_id", userID.Hex()),
		slog.String("deleted_user_email", existingUser.Email))

	return nil
}
