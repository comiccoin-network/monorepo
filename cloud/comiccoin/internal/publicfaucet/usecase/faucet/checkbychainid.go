// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/usecase/faucet/getbychainid.go
package faucet

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/domain/faucet"
)

type CheckIfFaucetExistsByChainIDUseCase interface {
	Execute(ctx context.Context, chainID uint16) (bool, error)
}

type checkIfFaucetExistsByChainIDUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom.Repository
}

func NewCheckIfFaucetExistsByChainIDUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo dom.Repository,
) CheckIfFaucetExistsByChainIDUseCase {
	return &checkIfFaucetExistsByChainIDUseCaseImpl{config, logger, repo}
}

func (uc *checkIfFaucetExistsByChainIDUseCaseImpl) Execute(ctx context.Context, chainID uint16) (bool, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if chainID == 0 {
		e["chain_id"] = "Chain ID is required"
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed validating",
			slog.Any("error", e))
		return false, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Get from database.
	//

	return uc.repo.CheckIfExistsByChainID(ctx, chainID)
}
