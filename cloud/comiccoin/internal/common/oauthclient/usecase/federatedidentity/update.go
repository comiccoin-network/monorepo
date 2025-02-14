// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/usecase/federatedidentity/update.go
package federatedidentity

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/config"
	dom_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/domain/federatedidentity"
)

type FederatedIdentityUpdateUseCase interface {
	Execute(ctx context.Context, federatedidentity *dom_federatedidentity.FederatedIdentity) error
}

type federatedidentityUpdateUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_federatedidentity.Repository
}

func NewFederatedIdentityUpdateUseCase(config *config.Configuration, logger *slog.Logger, repo dom_federatedidentity.Repository) FederatedIdentityUpdateUseCase {
	return &federatedidentityUpdateUseCaseImpl{config, logger, repo}
}

func (uc *federatedidentityUpdateUseCaseImpl) Execute(ctx context.Context, federatedidentity *dom_federatedidentity.FederatedIdentity) error {
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
	// STEP 2: Update in database.
	//

	return uc.repo.UpdateByID(ctx, federatedidentity)
}
