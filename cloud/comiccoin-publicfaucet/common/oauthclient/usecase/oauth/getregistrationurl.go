// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/oauth/getauthorizationurl.go
package oauth

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/config"
	dom_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/oauth"
)

type GetRegistrationURLUseCase interface {
	Execute(ctx context.Context, state string) (string, error)
}

type getRegistrationURLUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_oauth.Client
}

func NewGetRegistrationURLUseCase(config *config.Configuration, logger *slog.Logger, repo dom_oauth.Client) GetRegistrationURLUseCase {
	return &getRegistrationURLUseCaseImpl{config, logger, repo}
}

func (uc *getRegistrationURLUseCaseImpl) Execute(ctx context.Context, state string) (string, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if state == "" {
		e["state"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("validation failed for authorization URL generation",
			slog.Any("error", e))
		return "", httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Generate URL.
	//

	return uc.repo.GetRegistrationURL(state), nil
}
