package user

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/config"
	dom_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/domain/user"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type UserGetByIDUseCase interface {
	Execute(ctx context.Context, id primitive.ObjectID) (*dom_user.User, error)
}

type userGetByIDUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_user.Repository
}

func NewUserGetByIDUseCase(config *config.Configuration, logger *slog.Logger, repo dom_user.Repository) UserGetByIDUseCase {
	return &userGetByIDUseCaseImpl{config, logger, repo}
}

func (uc *userGetByIDUseCaseImpl) Execute(ctx context.Context, id primitive.ObjectID) (*dom_user.User, error) {
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
