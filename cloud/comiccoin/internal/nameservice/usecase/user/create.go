// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/nameservice/usecase/user/create.go
package user

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	dom_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/nameservice/domain/user"
)

type UserCreateUseCase interface {
	Execute(ctx context.Context, user *dom_user.User) error
}

type userCreateUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_user.Repository
}

func NewUserCreateUseCase(config *config.Configuration, logger *slog.Logger, repo dom_user.Repository) UserCreateUseCase {
	return &userCreateUseCaseImpl{config, logger, repo}
}

func (uc *userCreateUseCaseImpl) Execute(ctx context.Context, user *dom_user.User) error {
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
	// STEP 2: Insert into database.
	//

	return uc.repo.Create(ctx, user)
}
