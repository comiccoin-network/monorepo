package blockchainsyncstatus

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/native/desktop/comiccoin/domain"

	uc_blockchainsyncstatus "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/usecase/blockchainsyncstatus"
)

type GetBlockchainSyncStatusService struct {
	logger                         *slog.Logger
	getBlockchainSyncStatusUseCase *uc_blockchainsyncstatus.GetBlockchainSyncStatusUseCase
}

func NewGetBlockchainSyncStatusService(
	logger *slog.Logger,
	uc1 *uc_blockchainsyncstatus.GetBlockchainSyncStatusUseCase,
) *GetBlockchainSyncStatusService {
	return &GetBlockchainSyncStatusService{logger, uc1}
}

func (s *GetBlockchainSyncStatusService) Execute(ctx context.Context) (*domain.BlockchainSyncStatus, error) {
	blockchainSyncStatus, err := s.getBlockchainSyncStatusUseCase.Execute(ctx)
	if err != nil {
		s.logger.Error("failed getting blockchain sync status",
			slog.Any("error", err))
		return nil, err
	}

	return blockchainSyncStatus, nil
}
