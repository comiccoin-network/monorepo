package mempooltx

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/domain"
)

type MempoolTransactionListByChainIDUseCase interface {
	Execute(ctx context.Context, chainID uint16) ([]*domain.MempoolTransaction, error)
}

type mempoolTransactionListByChainIDUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   domain.MempoolTransactionRepository
}

func NewMempoolTransactionListByChainIDUseCase(config *config.Configuration, logger *slog.Logger, repo domain.MempoolTransactionRepository) MempoolTransactionListByChainIDUseCase {
	return &mempoolTransactionListByChainIDUseCaseImpl{config, logger, repo}
}

func (uc *mempoolTransactionListByChainIDUseCaseImpl) Execute(ctx context.Context, chainID uint16) ([]*domain.MempoolTransaction, error) {
	return uc.repo.ListByChainID(ctx, chainID)
}
