// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/service/token/refresh.go
package token

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/config"
	dom_profile "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/profile"
	uc_profile "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/profile"
)

type FetchProfileFromComicCoinGatewayService interface {
	Execute(ctx context.Context, accessToken string) (*dom_profile.ComicCoinProfile, error)
}

type fetchProfileFromComicCoinGatewayServiceImpl struct {
	config                                  *config.Configuration
	logger                                  *slog.Logger
	fetchProfileFromComicCoinGatewayUseCase uc_profile.FetchProfileFromComicCoinGatewayUseCase
}

func NewFetchProfileFromComicCoinGatewayService(
	config *config.Configuration,
	logger *slog.Logger,
	fetchProfileFromComicCoinGatewayUseCase uc_profile.FetchProfileFromComicCoinGatewayUseCase,
) FetchProfileFromComicCoinGatewayService {
	return &fetchProfileFromComicCoinGatewayServiceImpl{
		config:                                  config,
		logger:                                  logger,
		fetchProfileFromComicCoinGatewayUseCase: fetchProfileFromComicCoinGatewayUseCase,
	}
}

func (s *fetchProfileFromComicCoinGatewayServiceImpl) Execute(ctx context.Context, accessToken string) (*dom_profile.ComicCoinProfile, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if accessToken == "" {
		e["access_token"] = "Access token is required"
	}
	if len(e) != 0 {
		s.logger.Warn("Validation failed",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Get from remote server.
	//

	return s.fetchProfileFromComicCoinGatewayUseCase.Execute(ctx, accessToken)
}
