// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/usecase/remotefederatedidentity/post.go
package remotefederatedidentity

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/config"
	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/domain/remotefederatedidentity"
)

type UpdateRemoteFederdatedIdentityUseCase interface {
	Execute(ctx context.Context, req *dom.RemoteFederatedIdentityDTO, accessToken string) error
}

type updateRemoteFederdatedIdentityUseCase struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom.Repository
}

func NewUpdateRemoteFederdatedIdentityUseCase(config *config.Configuration, logger *slog.Logger, repo dom.Repository) UpdateRemoteFederdatedIdentityUseCase {
	return &updateRemoteFederdatedIdentityUseCase{config, logger, repo}
}

func (uc *updateRemoteFederdatedIdentityUseCase) Execute(ctx context.Context, req *dom.RemoteFederatedIdentityDTO, accessToken string) error {
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
		return httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Get from remote.
	//

	return uc.repo.PostUpdateToRemote(ctx, req, accessToken)
}
