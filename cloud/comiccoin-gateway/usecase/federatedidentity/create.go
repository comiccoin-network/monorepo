// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/usecase/federatedidentity/create.go
package federatedidentity

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/config"
	dom_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/domain/federatedidentity"
)

type FederatedIdentityCreateUseCase interface {
	Execute(ctx context.Context, federatedidentity *dom_federatedidentity.FederatedIdentity) error
}

type federatedidentityCreateUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_federatedidentity.Repository
}

func NewFederatedIdentityCreateUseCase(config *config.Configuration, logger *slog.Logger, repo dom_federatedidentity.Repository) FederatedIdentityCreateUseCase {
	return &federatedidentityCreateUseCaseImpl{config, logger, repo}
}

func (uc *federatedidentityCreateUseCaseImpl) Execute(ctx context.Context, federatedidentity *dom_federatedidentity.FederatedIdentity) error {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if federatedidentity == nil {
		e["federatedidentity"] = "missing value"
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

	return uc.repo.Create(ctx, federatedidentity)
}
