// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/usecase/federatedidentity/getbyid.go
package federatedidentity

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/config"
	dom_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/domain/federatedidentity"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type FederatedIdentityGetByIDUseCase interface {
	Execute(ctx context.Context, id primitive.ObjectID) (*dom_federatedidentity.FederatedIdentity, error)
}

type federatedidentityGetByIDUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_federatedidentity.Repository
}

func NewFederatedIdentityGetByIDUseCase(config *config.Configuration, logger *slog.Logger, repo dom_federatedidentity.Repository) FederatedIdentityGetByIDUseCase {
	return &federatedidentityGetByIDUseCaseImpl{config, logger, repo}
}

func (uc *federatedidentityGetByIDUseCaseImpl) Execute(ctx context.Context, id primitive.ObjectID) (*dom_federatedidentity.FederatedIdentity, error) {
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
