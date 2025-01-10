package blockchainsyncstatus

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/native/desktop/comiccoin/domain"
)

type SetBlockchainSyncStatusUseCase interface {
	Execute(ctx context.Context, isSyncing bool) error
}

type setBlockchainSyncStatusUseCaseImpl struct {
	logger *slog.Logger
	repo   domain.BlockchainSyncStatusRepository
}

func NewSetBlockchainSyncStatusUseCase(logger *slog.Logger, repo domain.BlockchainSyncStatusRepository) SetBlockchainSyncStatusUseCase {
	return &setBlockchainSyncStatusUseCaseImpl{logger, repo}
}

func (uc *setBlockchainSyncStatusUseCaseImpl) Execute(ctx context.Context, isSyncing bool) error {
	return uc.repo.Set(ctx, isSyncing)
}
