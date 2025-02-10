// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/token/deleteexpired.go
package token

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/config"
	dom_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/token"
)

type TokenDeleteExpiredUseCase interface {
	Execute(ctx context.Context) error
}

type tokenDeleteExpiredUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_token.Repository
}

func NewTokenDeleteExpiredUseCase(config *config.Configuration, logger *slog.Logger, repo dom_token.Repository) TokenDeleteExpiredUseCase {
	return &tokenDeleteExpiredUseCaseImpl{config, logger, repo}
}

func (uc *tokenDeleteExpiredUseCaseImpl) Execute(ctx context.Context) error {
	//
	// STEP 1: Delete expired tokens from database.
	//

	return uc.repo.DeleteExpiredTokens(ctx)
}
