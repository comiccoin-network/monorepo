// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/usecase/oauthsession/update.go
package oauthsession

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/config"
	dom_oauthsession "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/domain/oauthsession"
)

type UpdateOAuthSessionUseCase interface {
	Execute(ctx context.Context, session *dom_oauthsession.OAuthSession) error
}

type updateOAuthSessionUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_oauthsession.Repository
}

func NewUpdateOAuthSessionUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo dom_oauthsession.Repository,
) UpdateOAuthSessionUseCase {
	return &updateOAuthSessionUseCaseImpl{
		config: config,
		logger: logger,
		repo:   repo,
	}
}

func (uc *updateOAuthSessionUseCaseImpl) Execute(ctx context.Context, session *dom_oauthsession.OAuthSession) error {
	// Validation
	e := make(map[string]string)
	if session == nil {
		e["session"] = "missing value"
	} else {
		if session.SessionID == "" {
			e["session_id"] = "missing value"
		}
		if session.AccessToken == "" {
			e["access_token"] = "missing value"
		}
		if session.ExpiresAt.IsZero() {
			e["expires_at"] = "missing value"
		}
	}
	if len(e) != 0 {
		uc.logger.Warn("validation failed for session update",
			slog.Any("errors", e))
		return httperror.NewForBadRequest(&e)
	}

	return uc.repo.Update(ctx, session)
}
