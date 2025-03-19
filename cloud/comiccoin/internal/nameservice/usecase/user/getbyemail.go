// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/nameservice/usecase/user/getbyemail.go
package user

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	dom_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/nameservice/domain/user"
)

type UserGetByEmailUseCase interface {
	Execute(ctx context.Context, email string) (*dom_user.User, error)
}

type userGetByEmailUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_user.Repository
}

func NewUserGetByEmailUseCase(config *config.Configuration, logger *slog.Logger, repo dom_user.Repository) UserGetByEmailUseCase {
	return &userGetByEmailUseCaseImpl{config, logger, repo}
}

func (uc *userGetByEmailUseCaseImpl) Execute(ctx context.Context, email string) (*dom_user.User, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if email == "" {
		e["email"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("Validation failed for upsert",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Get from database.
	//

	return uc.repo.GetByEmail(ctx, email)
}
