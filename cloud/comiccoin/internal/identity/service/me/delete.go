// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/identity/service/me/delete.go
package me

import (
	"errors"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config/constants"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/password"
	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/securestring"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/identity/usecase/user"
)

type DeleteMeRequestDTO struct {
	Password string `json:"password"`
}

type DeleteMeService interface {
	Execute(sessCtx mongo.SessionContext, req *DeleteMeRequestDTO) error
}

type deleteMeServiceImpl struct {
	config                *config.Configuration
	logger                *slog.Logger
	passwordProvider      password.Provider
	userGetByIDUseCase    uc_user.UserGetByIDUseCase
	userDeleteByIDUseCase uc_user.UserDeleteByIDUseCase
}

func NewDeleteMeService(
	config *config.Configuration,
	logger *slog.Logger,
	passwordProvider password.Provider,
	userGetByIDUseCase uc_user.UserGetByIDUseCase,
	userDeleteByIDUseCase uc_user.UserDeleteByIDUseCase,
) DeleteMeService {
	return &deleteMeServiceImpl{
		config:                config,
		logger:                logger,
		passwordProvider:      passwordProvider,
		userGetByIDUseCase:    userGetByIDUseCase,
		userDeleteByIDUseCase: userDeleteByIDUseCase,
	}
}

func (svc *deleteMeServiceImpl) Execute(sessCtx mongo.SessionContext, req *DeleteMeRequestDTO) error {
	//
	// STEP 1: Validation
	//

	if req == nil {
		svc.logger.Warn("Failed validation with nil request")
		return httperror.NewForBadRequestWithSingleField("non_field_error", "Password is required")
	}

	e := make(map[string]string)
	if req.Password == "" {
		e["password"] = "Password is required"
	}
	if len(e) != 0 {
		svc.logger.Warn("Failed validation",
			slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Get required from context.
	//

	userID, ok := sessCtx.Value(constants.SessionUserID).(primitive.ObjectID)
	if !ok {
		svc.logger.Error("Failed getting local user id",
			slog.Any("error", "Not found in context: user_id"))
		return errors.New("user id not found in context")
	}

	//
	// STEP 3: Get user from database.
	//

	user, err := svc.userGetByIDUseCase.Execute(sessCtx, userID)
	if err != nil {
		svc.logger.Error("Failed getting user", slog.Any("error", err))
		return err
	}
	if user == nil {
		errMsg := "User does not exist"
		svc.logger.Error(errMsg, slog.Any("user_id", userID))
		return httperror.NewForBadRequestWithSingleField("message", errMsg)
	}

	//
	// STEP 4: Verify password.
	//

	securePassword, err := sstring.NewSecureString(req.Password)
	if err != nil {
		svc.logger.Error("Failed to create secure string", slog.Any("error", err))
		return err
	}

	passwordMatch, _ := svc.passwordProvider.ComparePasswordAndHash(securePassword, user.PasswordHash)
	if !passwordMatch {
		svc.logger.Warn("Password verification failed")
		return httperror.NewForBadRequestWithSingleField("password", "Incorrect password")
	}

	//
	// STEP 5: Delete user.
	//

	err = svc.userDeleteByIDUseCase.Execute(sessCtx, userID)
	if err != nil {
		svc.logger.Error("Failed to delete user", slog.Any("error", err))
		return err
	}

	svc.logger.Info("User successfully deleted", slog.Any("user_id", userID))
	return nil
}
