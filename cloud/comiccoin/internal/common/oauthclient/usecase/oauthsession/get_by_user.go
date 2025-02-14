// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/usecase/oauthsession/get_by_federatedidentity.go
package oauthsession

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/config"
	dom_oauthsession "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/domain/oauthsession"
)

type GetOAuthSessionByFederatedIdentityIDUseCase interface {
	Execute(ctx context.Context, federatedidentityID primitive.ObjectID) (*dom_oauthsession.OAuthSession, error)
}

type getOAuthSessionByFederatedIdentityIDUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_oauthsession.Repository
}

func NewGetOAuthSessionByFederatedIdentityIDUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo dom_oauthsession.Repository,
) GetOAuthSessionByFederatedIdentityIDUseCase {
	return &getOAuthSessionByFederatedIdentityIDUseCaseImpl{
		config: config,
		logger: logger,
		repo:   repo,
	}
}

func (uc *getOAuthSessionByFederatedIdentityIDUseCaseImpl) Execute(ctx context.Context, federatedidentityID primitive.ObjectID) (*dom_oauthsession.OAuthSession, error) {
	// Validation
	e := make(map[string]string)
	if federatedidentityID.IsZero() {
		e["federatedidentity_id"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("validation failed for session retrieval by federatedidentity ID",
			slog.Any("errors", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	return uc.repo.GetByFederatedIdentityID(ctx, federatedidentityID)
}
