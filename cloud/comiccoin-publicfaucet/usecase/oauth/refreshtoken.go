// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/usecase/oauth/refreshtoken.go
package oauth

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/config"
	dom_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/domain/oauth"
)

type RefreshTokenUseCase interface {
	Execute(ctx context.Context, refreshToken string) (*dom_oauth.TokenResponse, error)
}

type refreshTokenUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_oauth.Client
}

func NewRefreshTokenUseCase(config *config.Configuration, logger *slog.Logger, repo dom_oauth.Client) RefreshTokenUseCase {
	return &refreshTokenUseCaseImpl{config, logger, repo}
}

func (uc *refreshTokenUseCaseImpl) Execute(ctx context.Context, refreshToken string) (*dom_oauth.TokenResponse, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if refreshToken == "" {
		e["refresh_token"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("validation failed for token refresh",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Refresh token.
	//

	return uc.repo.RefreshToken(ctx, refreshToken)
}
