// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/federatedidentity/getbysesid.go
package federatedidentity

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/httperror"
	dom_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/federatedidentity"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/storage/database/mongodbcache"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/config"
)

type FederatedIdentityGetBySessionIDUseCase interface {
	Execute(ctx context.Context, sessionID string) (*dom_federatedidentity.FederatedIdentity, error)
}

type federatedidentityGetBySessionIDUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	cache  mongodbcache.Cacher
}

func NewFederatedIdentityGetBySessionIDUseCase(config *config.Configuration, logger *slog.Logger, ca mongodbcache.Cacher) FederatedIdentityGetBySessionIDUseCase {
	return &federatedidentityGetBySessionIDUseCaseImpl{config, logger, ca}
}

func (uc *federatedidentityGetBySessionIDUseCaseImpl) Execute(ctx context.Context, sessionID string) (*dom_federatedidentity.FederatedIdentity, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if sessionID == "" {
		e["session_id"] = "missing value"
	} else {
		//TODO: IMPL.
	}
	if len(e) != 0 {
		uc.logger.Warn("Validation failed for upsert",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2:
	//

	uc.logger.Debug("publicfaucet controller initialization started...")

	federatedidentityBytes, err := uc.cache.Get(ctx, sessionID)
	if err != nil {
		return nil, err
	}
	if federatedidentityBytes == nil {
		uc.logger.Warn("record not found")
		return nil, errors.New("record not found")
	}
	var federatedidentity dom_federatedidentity.FederatedIdentity
	err = json.Unmarshal(federatedidentityBytes, &federatedidentity)
	if err != nil {
		uc.logger.Error("unmarshalling failed", slog.Any("err", err))
		return nil, err
	}

	uc.logger.Debug("publicfaucet controller initialized")

	return &federatedidentity, nil
}
