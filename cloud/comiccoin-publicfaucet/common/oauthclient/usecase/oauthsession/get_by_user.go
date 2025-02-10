// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/oauthsession/get_by_user.go
package oauthsession

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/config"
	dom_oauthsession "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/oauthsession"
)

type GetOAuthSessionByUserIDUseCase interface {
	Execute(ctx context.Context, userID primitive.ObjectID) (*dom_oauthsession.OAuthSession, error)
}

type getOAuthSessionByUserIDUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_oauthsession.Repository
}

func NewGetOAuthSessionByUserIDUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo dom_oauthsession.Repository,
) GetOAuthSessionByUserIDUseCase {
	return &getOAuthSessionByUserIDUseCaseImpl{
		config: config,
		logger: logger,
		repo:   repo,
	}
}

func (uc *getOAuthSessionByUserIDUseCaseImpl) Execute(ctx context.Context, userID primitive.ObjectID) (*dom_oauthsession.OAuthSession, error) {
	// Validation
	e := make(map[string]string)
	if userID.IsZero() {
		e["user_id"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("validation failed for session retrieval by user ID",
			slog.Any("errors", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	return uc.repo.GetByUserID(ctx, userID)
}
