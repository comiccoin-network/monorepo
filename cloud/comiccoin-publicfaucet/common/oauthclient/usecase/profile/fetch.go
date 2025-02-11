// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/profile/fetch.go
package user

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/config"
	dom_profile "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/profile"
)

type FetchProfileFromComicCoinGatewayUseCase interface {
	Execute(ctx context.Context, accessToken string) (*dom_profile.ComicCoinProfile, error)
}

type fetchProfileFromComicCoinGatewayUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_profile.Repository
}

func NewFetchProfileFromComicCoinGatewayUseCase(config *config.Configuration, logger *slog.Logger, repo dom_profile.Repository) FetchProfileFromComicCoinGatewayUseCase {
	return &fetchProfileFromComicCoinGatewayUseCaseImpl{config, logger, repo}
}

func (uc *fetchProfileFromComicCoinGatewayUseCaseImpl) Execute(ctx context.Context, accessToken string) (*dom_profile.ComicCoinProfile, error) {
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

	return uc.repo.FetchProfileFromComicCoinGateway(ctx, accessToken)
}
