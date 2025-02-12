// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/remotefederatedidentity/fetch.go
package remotefederatedidentity

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/config"
	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/remotefederatedidentity"
)

type FetchRemoteFederdatedIdentityUseCase interface {
	Execute(ctx context.Context, accessToken string) (*dom.RemoteFederatedIdentityDTO, error)
}

type fetchRemoteFederdatedIdentityUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom.Repository
}

func NewFetchRemoteFederdatedIdentityUseCase(config *config.Configuration, logger *slog.Logger, repo dom.Repository) FetchRemoteFederdatedIdentityUseCase {
	return &fetchRemoteFederdatedIdentityUseCaseImpl{config, logger, repo}
}

func (uc *fetchRemoteFederdatedIdentityUseCaseImpl) Execute(ctx context.Context, accessToken string) (*dom.RemoteFederatedIdentityDTO, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if accessToken == "" {
		e["access_token"] = "Access token is required"
	}
	if len(e) != 0 {
		uc.logger.Warn("Validation failed",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Get from remote.
	//

	return uc.repo.FetchFromRemoteByAccessToken(ctx, accessToken)
}
