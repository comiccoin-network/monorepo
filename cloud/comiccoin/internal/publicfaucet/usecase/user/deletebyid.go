// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/usecase/user/getbyid.go
package user

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	dom_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/domain/user"
)

type UserDeleteByIDUseCase interface {
	Execute(ctx context.Context, id primitive.ObjectID) error
}

type userDeleteByIDImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_user.Repository
}

func NewUserDeleteByIDUseCase(config *config.Configuration, logger *slog.Logger, repo dom_user.Repository) UserDeleteByIDUseCase {
	return &userDeleteByIDImpl{config, logger, repo}
}

func (uc *userDeleteByIDImpl) Execute(ctx context.Context, id primitive.ObjectID) error {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if id.IsZero() {
		e["id"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("Validation failed for upsert",
			slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Get from database.
	//

	return uc.repo.DeleteByID(ctx, id)
}
