// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/oauthstate/get.go
package oauthstate

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/config"
	dom_oauthstate "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/oauthstate"
)

type GetOAuthStateUseCase interface {
	Execute(ctx context.Context, state string) (*dom_oauthstate.OAuthState, error)
}

type getOAuthStateUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_oauthstate.Repository
}

func NewGetOAuthStateUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo dom_oauthstate.Repository,
) GetOAuthStateUseCase {
	return &getOAuthStateUseCaseImpl{
		config: config,
		logger: logger,
		repo:   repo,
	}
}

func (uc *getOAuthStateUseCaseImpl) Execute(ctx context.Context, state string) (*dom_oauthstate.OAuthState, error) {
	// Validation
	e := make(map[string]string)
	if state == "" {
		e["state"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("validation failed for state retrieval",
			slog.Any("errors", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	return uc.repo.GetByState(ctx, state)
}
