package blockchainstate

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/domain"
	uc_blockchainstate "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/blockchainstate"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
)

type GetBlockchainStateService interface {
	Execute(ctx context.Context, chainID uint16) (*domain.BlockchainState, error)
}

type getBlockchainStateServiceImpl struct {
	config                    *config.Configuration
	logger                    *slog.Logger
	getBlockchainStateUseCase uc_blockchainstate.GetBlockchainStateUseCase
}

func NewGetBlockchainStateService(
	cfg *config.Configuration,
	logger *slog.Logger,
	uc uc_blockchainstate.GetBlockchainStateUseCase,
) GetBlockchainStateService {
	return &getBlockchainStateServiceImpl{cfg, logger, uc}
}

func (s *getBlockchainStateServiceImpl) Execute(ctx context.Context, chainID uint16) (*domain.BlockchainState, error) {
	blkchState, err := s.getBlockchainStateUseCase.Execute(ctx, chainID)
	if err != nil {
		s.logger.Error("Failed getting blockchain state", slog.Any("error", err))
		return nil, err
	}
	if blkchState == nil {
		errStr := fmt.Sprintf("Blockchain state does not exist for chain ID: %v", chainID)
		s.logger.Error("Failed getting blockchain state", slog.Any("error", errStr))
		return nil, httperror.NewForNotFoundWithSingleField("chain_id", errStr)
	}
	return blkchState, nil
}
