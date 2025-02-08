// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/usecase/oauthstate/delete_expired.go
package oauthstate

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/config"
	dom_oauthstate "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/domain/oauthstate"
)

type DeleteExpiredOAuthStatesUseCase interface {
	Execute(ctx context.Context) error
}

type deleteExpiredOAuthStatesUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_oauthstate.Repository
}

func NewDeleteExpiredOAuthStatesUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo dom_oauthstate.Repository,
) DeleteExpiredOAuthStatesUseCase {
	return &deleteExpiredOAuthStatesUseCaseImpl{
		config: config,
		logger: logger,
		repo:   repo,
	}
}

func (uc *deleteExpiredOAuthStatesUseCaseImpl) Execute(ctx context.Context) error {
	return uc.repo.DeleteExpired(ctx)
}
