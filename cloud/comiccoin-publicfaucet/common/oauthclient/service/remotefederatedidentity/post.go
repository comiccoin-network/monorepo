// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/service/remotefederatedidentity/post.go
package remotefederatedidentity

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/config"
	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/remotefederatedidentity"
	uc_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/federatedidentity"
	uc_remotefederatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/remotefederatedidentity"
)

type UpdateRemoteFederdatedIdentityService interface {
	Execute(ctx context.Context, req *dom.RemoteFederatedIdentityDTO, accessToken string) error
}

type updateRemoteFederdatedIdentityService struct {
	config                                *config.Configuration
	logger                                *slog.Logger
	updateRemoteFederdatedIdentityUseCase uc_remotefederatedidentity.UpdateRemoteFederdatedIdentityUseCase
	federatedIdentityGetByIDUseCase       uc_federatedidentity.FederatedIdentityGetByIDUseCase
	federatedIdentityCreateUseCase        uc_federatedidentity.FederatedIdentityCreateUseCase
	federatedIdentityUpdateUseCase        uc_federatedidentity.FederatedIdentityUpdateUseCase
}

func NewUpdateRemoteFederdatedIdentityService(
	config *config.Configuration,
	logger *slog.Logger,
	updateRemoteFederdatedIdentityUseCase uc_remotefederatedidentity.UpdateRemoteFederdatedIdentityUseCase,
	federatedIdentityGetByIDUseCase uc_federatedidentity.FederatedIdentityGetByIDUseCase,
	federatedIdentityCreateUseCase uc_federatedidentity.FederatedIdentityCreateUseCase,
	federatedIdentityUpdateUseCase uc_federatedidentity.FederatedIdentityUpdateUseCase,
) UpdateRemoteFederdatedIdentityService {
	return &updateRemoteFederdatedIdentityService{
		config:                                config,
		logger:                                logger,
		updateRemoteFederdatedIdentityUseCase: updateRemoteFederdatedIdentityUseCase,
		federatedIdentityGetByIDUseCase:       federatedIdentityGetByIDUseCase,
		federatedIdentityCreateUseCase:        federatedIdentityCreateUseCase,
		federatedIdentityUpdateUseCase:        federatedIdentityUpdateUseCase,
	}
}

func (svc *updateRemoteFederdatedIdentityService) Execute(ctx context.Context, req *dom.RemoteFederatedIdentityDTO, accessToken string) error {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if accessToken == "" {
		e["access_token"] = "Access token is required"
	}
	if len(e) != 0 {
		svc.logger.Warn("Validation failed",
			slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Get from remote.
	//

	return svc.updateRemoteFederdatedIdentityUseCase.Execute(ctx, req, accessToken)
}
