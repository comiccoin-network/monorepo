// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/usecase/oauthstate/create.go
package oauthstate

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/config"
	dom_oauthstate "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/domain/oauthstate"
)

type CreateOAuthStateUseCase interface {
	Execute(ctx context.Context, state *dom_oauthstate.OAuthState) error
}

type createOAuthStateUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_oauthstate.Repository
}

func NewCreateOAuthStateUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo dom_oauthstate.Repository,
) CreateOAuthStateUseCase {
	return &createOAuthStateUseCaseImpl{
		config: config,
		logger: logger,
		repo:   repo,
	}
}

func (uc *createOAuthStateUseCaseImpl) Execute(ctx context.Context, state *dom_oauthstate.OAuthState) error {
	// Validation
	e := make(map[string]string)
	if state == nil {
		e["state"] = "missing value"
	} else {
		if state.State == "" {
			e["state_value"] = "missing value"
		}
		if state.ExpiresAt.IsZero() {
			e["expires_at"] = "missing value"
		}
	}
	if len(e) != 0 {
		uc.logger.Warn("validation failed for state creation",
			slog.Any("errors", e))
		return httperror.NewForBadRequest(&e)
	}

	return uc.repo.Create(ctx, state)
}
