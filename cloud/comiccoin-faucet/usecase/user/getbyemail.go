package user

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/domain"
)

type UserGetByEmailUseCase struct {
	config *config.Configuration
	logger *slog.Logger
	repo   domain.UserRepository
}

func NewUserGetByEmailUseCase(config *config.Configuration, logger *slog.Logger, repo domain.UserRepository) *UserGetByEmailUseCase {
	return &UserGetByEmailUseCase{config, logger, repo}
}

func (uc *UserGetByEmailUseCase) Execute(ctx context.Context, email string) (*domain.User, error) {
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
