package usecase

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/native/desktop/comiccoin/domain"
)

type SetBlockchainSyncStatusUseCase struct {
	logger *slog.Logger
	repo   domain.BlockchainSyncStatusRepository
}

func NewSetBlockchainSyncStatusUseCase(logger *slog.Logger, repo domain.BlockchainSyncStatusRepository) *SetBlockchainSyncStatusUseCase {
	return &SetBlockchainSyncStatusUseCase{logger, repo}
}

func (uc *SetBlockchainSyncStatusUseCase) Execute(ctx context.Context, isSyncing bool) error {
	return uc.repo.Set(ctx, isSyncing)
}
