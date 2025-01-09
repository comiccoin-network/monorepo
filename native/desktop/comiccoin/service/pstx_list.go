package service

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/native/desktop/comiccoin/domain"
	uc_pstx "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/usecase/pstx"
)

type PendingSignedTransactionListService struct {
	logger                              *slog.Logger
	listPendingSignedTransactionUseCase *uc_pstx.ListPendingSignedTransactionUseCase
}

func NewPendingSignedTransactionListService(
	logger *slog.Logger,
	uc1 *uc_pstx.ListPendingSignedTransactionUseCase,
) *PendingSignedTransactionListService {
	return &PendingSignedTransactionListService{logger, uc1}
}

func (s *PendingSignedTransactionListService) Execute(ctx context.Context) ([]*domain.PendingSignedTransaction, error) {
	return s.listPendingSignedTransactionUseCase.Execute(ctx)
}
