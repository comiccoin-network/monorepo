// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/oauth/introspecttoken.go
package oauth

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/config"
	dom_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/oauth"
)

type IntrospectTokenUseCase interface {
	Execute(ctx context.Context, token string) (*dom_oauth.IntrospectionResponse, error)
}

type introspectTokenUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_oauth.Client
}

func NewIntrospectTokenUseCase(config *config.Configuration, logger *slog.Logger, repo dom_oauth.Client) IntrospectTokenUseCase {
	return &introspectTokenUseCaseImpl{config, logger, repo}
}

func (uc *introspectTokenUseCaseImpl) Execute(ctx context.Context, token string) (*dom_oauth.IntrospectionResponse, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if token == "" {
		e["token"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("validation failed for token introspection",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Introspect token.
	//

	return uc.repo.IntrospectToken(ctx, token)
}
