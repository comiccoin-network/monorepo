// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/user/update.go
package user

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/httperror"
	dom_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/user"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/config"
)

type UserUpdateUseCase interface {
	Execute(ctx context.Context, user *dom_user.User) error
}

type userUpdateUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_user.Repository
}

func NewUserUpdateUseCase(config *config.Configuration, logger *slog.Logger, repo dom_user.Repository) UserUpdateUseCase {
	return &userUpdateUseCaseImpl{config, logger, repo}
}

func (uc *userUpdateUseCaseImpl) Execute(ctx context.Context, user *dom_user.User) error {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if user == nil {
		e["user"] = "missing value"
	} else {
		//TODO: IMPL.
	}
	if len(e) != 0 {
		uc.logger.Warn("Validation failed for upsert",
			slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Update in database.
	//

	return uc.repo.UpdateByID(ctx, user)
}
