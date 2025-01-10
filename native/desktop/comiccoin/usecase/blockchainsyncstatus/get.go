package blockchainsyncstatus

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/native/desktop/comiccoin/domain"
)

type GetBlockchainSyncStatusUseCase interface {
	Execute(ctx context.Context) (*domain.BlockchainSyncStatus, error)
}

type getBlockchainSyncStatusUseCaseImpl struct {
	logger *slog.Logger
	repo   domain.BlockchainSyncStatusRepository
}

func NewGetBlockchainSyncStatusUseCase(logger *slog.Logger, repo domain.BlockchainSyncStatusRepository) GetBlockchainSyncStatusUseCase {
	return &getBlockchainSyncStatusUseCaseImpl{logger, repo}
}

func (uc *getBlockchainSyncStatusUseCaseImpl) Execute(ctx context.Context) (*domain.BlockchainSyncStatus, error) {
	return uc.repo.Get(ctx)
}
