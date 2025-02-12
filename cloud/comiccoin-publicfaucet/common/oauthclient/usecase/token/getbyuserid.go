// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/token/getbyfederatedidentityid.go
package token

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/config"
	dom_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/token"
)

type TokenGetByFederatedIdentityIDUseCase interface {
	Execute(ctx context.Context, federatedidentityID primitive.ObjectID) (*dom_token.Token, error)
}

type tokenGetByFederatedIdentityIDUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_token.Repository
}

func NewTokenGetByFederatedIdentityIDUseCase(config *config.Configuration, logger *slog.Logger, repo dom_token.Repository) TokenGetByFederatedIdentityIDUseCase {
	return &tokenGetByFederatedIdentityIDUseCaseImpl{config, logger, repo}
}

func (uc *tokenGetByFederatedIdentityIDUseCaseImpl) Execute(ctx context.Context, federatedidentityID primitive.ObjectID) (*dom_token.Token, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if federatedidentityID.IsZero() {
		e["federatedidentity_id"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("validation failed for get token",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Get from database.
	//

	return uc.repo.GetByFederatedIdentityID(ctx, federatedidentityID)
}
