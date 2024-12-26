package usecase

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/domain"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type UserGetByIDUseCase struct {
	config *config.Configuration
	logger *slog.Logger
	repo   domain.UserRepository
}

func NewUserGetByIDUseCase(config *config.Configuration, logger *slog.Logger, repo domain.UserRepository) *UserGetByIDUseCase {
	return &UserGetByIDUseCase{config, logger, repo}
}

func (uc *UserGetByIDUseCase) Execute(ctx context.Context, id primitive.ObjectID) (*domain.User, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if id.IsZero() {
		e["id"] = "missing value"
	} else {
		//TODO: IMPL.
	}
	if len(e) != 0 {
		uc.logger.Warn("Validation failed for upsert",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Get from database.
	//

	return uc.repo.GetByID(ctx, id)
}
