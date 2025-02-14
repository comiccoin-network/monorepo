// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/usecase/oauthsession/delete.go
package oauthsession

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/config"
	dom_oauthsession "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/domain/oauthsession"
)

type DeleteOAuthSessionUseCase interface {
	Execute(ctx context.Context, sessionID string) error
}

type deleteSessionUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_oauthsession.Repository
}

func NewDeleteOAuthSessionUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo dom_oauthsession.Repository,
) DeleteOAuthSessionUseCase {
	return &deleteSessionUseCaseImpl{
		config: config,
		logger: logger,
		repo:   repo,
	}
}

func (uc *deleteSessionUseCaseImpl) Execute(ctx context.Context, sessionID string) error {
	// Validation
	e := make(map[string]string)
	if sessionID == "" {
		e["session_id"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("validation failed for session deletion",
			slog.Any("errors", e))
		return httperror.NewForBadRequest(&e)
	}

	return uc.repo.Delete(ctx, sessionID)
}
