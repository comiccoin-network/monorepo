// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/oauthstate/delete.go
package oauthstate

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/config"
	dom_oauthstate "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/oauthstate"
)

type DeleteOAuthStateUseCase interface {
	Execute(ctx context.Context, state string) error
}

type deleteOAuthStateUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_oauthstate.Repository
}

func NewDeleteOAuthStateUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo dom_oauthstate.Repository,
) DeleteOAuthStateUseCase {
	return &deleteOAuthStateUseCaseImpl{
		config: config,
		logger: logger,
		repo:   repo,
	}
}

func (uc *deleteOAuthStateUseCaseImpl) Execute(ctx context.Context, state string) error {
	// Validation
	e := make(map[string]string)
	if state == "" {
		e["state"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("validation failed for state deletion",
			slog.Any("errors", e))
		return httperror.NewForBadRequest(&e)
	}

	return uc.repo.Delete(ctx, state)
}
