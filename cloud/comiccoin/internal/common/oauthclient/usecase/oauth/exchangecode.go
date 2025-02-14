// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/usecase/oauth/exchangecode.go
package oauth

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/config"
	dom_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/domain/oauth"
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
