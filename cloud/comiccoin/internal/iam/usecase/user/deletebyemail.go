// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/usecase/user/getbyid.go
package user

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	dom_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/user"
)

type UserDeleteUserByEmailUseCase interface {
	Execute(ctx context.Context, email string) error
}

type userDeleteUserByEmailImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_user.Repository
}

func NewUserDeleteUserByEmailUseCase(config *config.Configuration, logger *slog.Logger, repo dom_user.Repository) UserDeleteUserByEmailUseCase {
	return &userDeleteUserByEmailImpl{config, logger, repo}
}

func (uc *userDeleteUserByEmailImpl) Execute(ctx context.Context, email string) error {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if email == "" {
		e["email"] = "missing value"
	} else {
		//TODO: IMPL.
	}
	if len(e) != 0 {
		uc.logger.Warn("Validation failed for upsert",
			slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Get from database.
	//

	return uc.repo.DeleteByEmail(ctx, email)
}
