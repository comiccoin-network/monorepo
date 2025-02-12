// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/token/upsertbyfederatedidentityid.go
package token

import (
	"context"
	"log/slog"
	"time"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/config"
	dom_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/token"
)

type TokenUpsertByFederatedIdentityIDUseCase interface {
	Execute(ctx context.Context, token *dom_token.Token) error
}

type tokenUpsertByFederatedIdentityIDUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_token.Repository
}

func NewTokenUpsertByFederatedIdentityIDUseCase(config *config.Configuration, logger *slog.Logger, repo dom_token.Repository) TokenUpsertByFederatedIdentityIDUseCase {
	return &tokenUpsertByFederatedIdentityIDUseCaseImpl{config, logger, repo}
}

func (uc *tokenUpsertByFederatedIdentityIDUseCaseImpl) Execute(ctx context.Context, token *dom_token.Token) error {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if token == nil {
		e["token"] = "missing value"
	} else {
		if token.FederatedIdentityID.IsZero() {
			e["federatedidentity_id"] = "missing value"
		}
		if token.AccessToken == "" {
			e["access_token"] = "missing value"
		}
		if token.RefreshToken == "" {
			e["refresh_token"] = "missing value"
		}
		if token.ExpiresAt.IsZero() {
			e["expires_at"] = "missing value"
		}
		if token.ExpiresAt.Before(time.Now()) {
			e["expires_at"] = "cannot be in the past"
		}
	}
	if len(e) != 0 {
		uc.logger.Warn("validation failed for token upsert",
			slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Upsert into database.
	//

	return uc.repo.UpsertByFederatedIdentityID(ctx, token)
}
