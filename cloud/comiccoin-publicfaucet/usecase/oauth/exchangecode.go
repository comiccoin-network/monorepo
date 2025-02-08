// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/usecase/oauth/exchangecode.go
package oauth

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/config"
	dom_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/domain/oauth"
)

type ExchangeCodeUseCase interface {
	Execute(ctx context.Context, code string) (*dom_oauth.TokenResponse, error)
}

type exchangeCodeUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_oauth.Client
}

func NewExchangeCodeUseCase(config *config.Configuration, logger *slog.Logger, repo dom_oauth.Client) ExchangeCodeUseCase {
	return &exchangeCodeUseCaseImpl{config, logger, repo}
}

func (uc *exchangeCodeUseCaseImpl) Execute(ctx context.Context, code string) (*dom_oauth.TokenResponse, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if code == "" {
		e["code"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("validation failed for code exchange",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Exchange code for token.
	//

	return uc.repo.ExchangeCode(ctx, code)
}
