package service

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/native/desktop/comiccoin/domain"

	"github.com/comiccoin-network/monorepo/native/desktop/comiccoin/usecase"
)

type GetBlockchainSyncStatusService struct {
	logger            *slog.Logger
	getAccountUseCase *usecase.GetBlockchainSyncStatusUseCase
}

func NewGetBlockchainSyncStatusService(
	logger *slog.Logger,
	uc1 *usecase.GetBlockchainSyncStatusUseCase,
) *GetBlockchainSyncStatusService {
	return &GetBlockchainSyncStatusService{logger, uc1}
}

func (s *GetBlockchainSyncStatusService) Execute(ctx context.Context) (*domain.BlockchainSyncStatus, error) {
	blockchainSyncStatus, err := s.getAccountUseCase.Execute(ctx)
	if err != nil {
		s.logger.Error("failed getting blockchain sync status",
			slog.Any("error", err))
		return nil, err
	}

	return blockchainSyncStatus, nil
}
