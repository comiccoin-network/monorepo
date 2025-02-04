package blockchainstate

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"
)

type GetBlockchainStateUseCase interface {
	Execute(ctx context.Context, chainID uint16) (*domain.BlockchainState, error)
}

type getBlockchainStateUseCaseImpl struct {
	logger *slog.Logger
	repo   domain.BlockchainStateRepository
}

func NewGetBlockchainStateUseCase(logger *slog.Logger, repo domain.BlockchainStateRepository) GetBlockchainStateUseCase {
	return &getBlockchainStateUseCaseImpl{logger, repo}
}

func (uc *getBlockchainStateUseCaseImpl) Execute(ctx context.Context, chainID uint16) (*domain.BlockchainState, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if chainID == 0 {
		e["chainID"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed getting genesis block",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Insert into database.
	//

	return uc.repo.GetByChainID(ctx, chainID)
}
