// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/service/user/delete.go
package user

import (
	"errors"
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
func (svc *deleteUserServiceImpl) Execute(sessCtx mongo.SessionContext, userID primitive.ObjectID) error {
	//
	// Extract authenticated user information from context.
	//

	sessionUserID, ok := sessCtx.Value(constants.SessionUserID).(primitive.ObjectID)
	if !ok {
		svc.logger.Error("Failed getting local user id",
			slog.Any("error", "Not found in context: user_id"))
		return errors.New("user id not found in context")
	}
	sessionUserRole, _ := sessCtx.Value(constants.SessionUserRole).(int8)
	if sessionUserRole != user.UserRoleRoot {
		svc.logger.Error("Wrong user permission",
			slog.Any("error", "User is not root"))
		return errors.New("user is not administration")
	}

	// Prevent admin from deleting themselves
	if sessionUserID == userID {
		return httperror.NewForBadRequestWithSingleField("message", "Cannot delete yourself")
	}

	//
	// Santize and validate input fields.
	//

	// Validate userID
	if userID.IsZero() {
		return httperror.NewForBadRequestWithSingleField("id", "User ID is required")
	}

	//
	// Delete from database
	//

	if err := svc.userDeleteByIDUseCase.Execute(sessCtx, userID); err != nil {
		svc.logger.Error("Failed to delete user",
			slog.String("user_id", userID.Hex()),
			slog.Any("error", err))
		return err
	}

	svc.logger.Info("Admin deleted user",
		slog.String("admin_id", sessionUserID.Hex()),
		slog.String("deleted_user_id", userID.Hex()))

	return nil
}
