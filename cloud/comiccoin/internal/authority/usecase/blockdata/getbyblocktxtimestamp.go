package blockdata

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/domain"
)

type GetBlockDataByBlockTransactionTimestampUseCase interface {
	Execute(ctx context.Context, nonce uint64) (*domain.BlockData, error)
}

type getBlockDataByBlockTransactionTimestampUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   domain.BlockDataRepository
}

func NewGetBlockDataByBlockTransactionTimestampUseCase(config *config.Configuration, logger *slog.Logger, repo domain.BlockDataRepository) GetBlockDataByBlockTransactionTimestampUseCase {
	return &getBlockDataByBlockTransactionTimestampUseCaseImpl{config, logger, repo}
}

func (uc *getBlockDataByBlockTransactionTimestampUseCaseImpl) Execute(ctx context.Context, nonce uint64) (*domain.BlockData, error) {
	data, err := uc.repo.GetByBlockTransactionTimestamp(ctx, nonce)
	if err != nil {
		uc.logger.Error("failed getting block data by block transaction timestamp",
			slog.Any("error", err))
		return nil, err
	}
	return data, nil
}
