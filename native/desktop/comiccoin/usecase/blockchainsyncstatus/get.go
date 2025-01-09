package blockchainsyncstatus

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/native/desktop/comiccoin/domain"
)

type GetBlockchainSyncStatusUseCase struct {
	logger *slog.Logger
	repo   domain.BlockchainSyncStatusRepository
}

func NewGetBlockchainSyncStatusUseCase(logger *slog.Logger, repo domain.BlockchainSyncStatusRepository) *GetBlockchainSyncStatusUseCase {
	return &GetBlockchainSyncStatusUseCase{logger, repo}
}

func (uc *GetBlockchainSyncStatusUseCase) Execute(ctx context.Context) (*domain.BlockchainSyncStatus, error) {
	return uc.repo.Get(ctx)
}
