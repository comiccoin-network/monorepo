// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/usecase/oauthsession/get.go
package oauthsession

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/config"
	dom_oauthsession "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/domain/oauthsession"
)

type GetSessionUseCase interface {
	Execute(ctx context.Context, sessionID string) (*dom_oauthsession.OAuthSession, error)
}

type getSessionUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_oauthsession.Repository
}

func NewGetSessionUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo dom_oauthsession.Repository,
) GetSessionUseCase {
	return &getSessionUseCaseImpl{
		config: config,
		logger: logger,
		repo:   repo,
	}
}

func (uc *getSessionUseCaseImpl) Execute(ctx context.Context, sessionID string) (*dom_oauthsession.OAuthSession, error) {
	// Validation
	e := make(map[string]string)
	if sessionID == "" {
		e["session_id"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("validation failed for session retrieval",
			slog.Any("errors", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	return uc.repo.GetBySessionID(ctx, sessionID)
}
