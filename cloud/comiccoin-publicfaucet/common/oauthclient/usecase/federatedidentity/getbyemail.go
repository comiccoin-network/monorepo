// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/federatedidentity/getbyemail.go
package federatedidentity

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/httperror"
	dom_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/federatedidentity"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/config"
)

type FederatedIdentityGetByEmailUseCase interface {
	Execute(ctx context.Context, email string) (*dom_federatedidentity.FederatedIdentity, error)
}

type federatedidentityGetByEmailUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_federatedidentity.Repository
}

func NewFederatedIdentityGetByEmailUseCase(config *config.Configuration, logger *slog.Logger, repo dom_federatedidentity.Repository) FederatedIdentityGetByEmailUseCase {
	return &federatedidentityGetByEmailUseCaseImpl{config, logger, repo}
}

func (uc *federatedidentityGetByEmailUseCaseImpl) Execute(ctx context.Context, email string) (*dom_federatedidentity.FederatedIdentity, error) {
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
