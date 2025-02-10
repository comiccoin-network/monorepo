// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/oauthsession/delete_expired.go
package oauthsession

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/config"
	dom_oauthsession "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/oauthsession"
)

type DeleteExpiredOAuthSessionsUseCase interface {
	Execute(ctx context.Context) error
}

type deleteExpiredOAuthSessionsUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_oauthsession.Repository
}

func NewDeleteExpiredOAuthSessionsUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo dom_oauthsession.Repository,
) DeleteExpiredOAuthSessionsUseCase {
	return &deleteExpiredOAuthSessionsUseCaseImpl{
		config: config,
		logger: logger,
		repo:   repo,
	}
}

func (uc *deleteExpiredOAuthSessionsUseCaseImpl) Execute(ctx context.Context) error {
	return uc.repo.DeleteExpired(ctx)
}
