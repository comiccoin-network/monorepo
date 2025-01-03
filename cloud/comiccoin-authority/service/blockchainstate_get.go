package service

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"
	uc_blockchainstate "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/blockchainstate"
)

type GetBlockchainStateService struct {
	config                    *config.Configuration
	logger                    *slog.Logger
	getBlockchainStateUseCase *uc_blockchainstate.GetBlockchainStateUseCase
}

func NewGetBlockchainStateService(
	cfg *config.Configuration,
	logger *slog.Logger,
	uc *uc_blockchainstate.GetBlockchainStateUseCase,
) *GetBlockchainStateService {
	return &GetBlockchainStateService{cfg, logger, uc}
}

func (s *GetBlockchainStateService) Execute(ctx context.Context, chainID uint16) (*domain.BlockchainState, error) {
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
