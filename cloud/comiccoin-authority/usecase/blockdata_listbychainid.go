package usecase

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"
)

type ListBlockDataByChainIDUseCase struct {
	config *config.Configuration
	logger *slog.Logger
	repo   domain.BlockDataRepository
}

func NewListBlockDataByChainIDUseCase(config *config.Configuration, logger *slog.Logger, repo domain.BlockDataRepository) *ListBlockDataByChainIDUseCase {
	return &ListBlockDataByChainIDUseCase{config, logger, repo}
}

func (uc *ListBlockDataByChainIDUseCase) Execute(ctx context.Context) ([]*domain.BlockData, error) {
	data, err := uc.repo.ListByChainID(ctx, uc.config.Blockchain.ChainID)
	if err != nil {
		uc.logger.Error("failed listing all block data", slog.Any("error", err))
		return nil, err
	}
	return data, nil
}
