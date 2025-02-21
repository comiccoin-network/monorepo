// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/usecase/faucet/updatebychainid.go
package faucet

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/domain/faucet"
)

type FaucetUpdateByChainIDUseCase interface {
	Execute(ctx context.Context, faucet *dom.Faucet) error
}

type faucetUpdateByChainIDUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom.Repository
}

func NewFaucetUpdateByChainIDUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo dom.Repository,
) FaucetUpdateByChainIDUseCase {
	return &faucetUpdateByChainIDUseCaseImpl{config, logger, repo}
}

func (uc *faucetUpdateByChainIDUseCaseImpl) Execute(ctx context.Context, faucet *dom.Faucet) error {
	//
	// STEP 1: Validation.
	//

	if faucet == nil {
		uc.logger.Error("Failed validating",
			slog.Any("non_field_error", "no data was set"))
		return httperror.NewForBadRequestWithSingleField("non_field_error", "no data was set")
	}

	e := make(map[string]string)
	if faucet.ChainID == 0 {
		e["chain_id"] = "Chain ID is required"
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed validating",
			slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Update database record.
	//

	return uc.repo.UpdateByChainID(ctx, faucet)
}
