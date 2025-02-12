// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/usecase/user/getbyid.go
package user

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/config"
	dom_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/domain/user"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type UserGetByFederatedIdentityIDUseCase interface {
	Execute(ctx context.Context, id primitive.ObjectID) (*dom_user.User, error)
}

type userGetByFederatedIdentityIDUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_user.Repository
}

func NewUserGetByFederatedIdentityIDUseCase(config *config.Configuration, logger *slog.Logger, repo dom_user.Repository) UserGetByFederatedIdentityIDUseCase {
	return &userGetByFederatedIdentityIDUseCaseImpl{config, logger, repo}
}

func (uc *userGetByFederatedIdentityIDUseCaseImpl) Execute(ctx context.Context, federatedIdentityID primitive.ObjectID) (*dom_user.User, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if federatedIdentityID.IsZero() {
		e["federatedidentity_id"] = "Federated identity id is required"
	}
	if len(e) != 0 {
		uc.logger.Warn("Validation failed",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Get from database.
	//

	return uc.repo.GetByFederatedIdentityID(ctx, federatedIdentityID)
}
