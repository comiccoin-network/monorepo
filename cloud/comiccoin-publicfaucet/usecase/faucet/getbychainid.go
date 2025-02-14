// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/usecase/faucet/getbychainid.go
package faucet

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/config"
	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/domain/faucet"
)

type GetFaucetByChainIDUseCase interface {
	Execute(ctx context.Context, chainID uint16) (*dom.Faucet, error)
}

type getFaucetByChainIDUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom.Repository
}

func NewGetFaucetByChainIDUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo dom.Repository,
) GetFaucetByChainIDUseCase {
	return &getFaucetByChainIDUseCaseImpl{config, logger, repo}
}

func (uc *getFaucetByChainIDUseCaseImpl) Execute(ctx context.Context, chainID uint16) (*dom.Faucet, error) {
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
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Get from database.
	//

	return uc.repo.GetByChainID(ctx, chainID)
}
