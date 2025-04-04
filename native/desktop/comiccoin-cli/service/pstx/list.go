package pstx

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/domain"
	uc_pstx "github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/usecase/pstx"
)

type PendingSignedTransactionListService interface {
	Execute(ctx context.Context) ([]*domain.PendingSignedTransaction, error)
}

type pendingSignedTransactionListServiceImpl struct {
	logger                              *slog.Logger
	listPendingSignedTransactionUseCase uc_pstx.ListPendingSignedTransactionUseCase
}

func NewPendingSignedTransactionListService(
	logger *slog.Logger,
	uc1 uc_pstx.ListPendingSignedTransactionUseCase,
) PendingSignedTransactionListService {
	return &pendingSignedTransactionListServiceImpl{logger, uc1}
}

func (s *pendingSignedTransactionListServiceImpl) Execute(ctx context.Context) ([]*domain.PendingSignedTransaction, error) {
	return s.listPendingSignedTransactionUseCase.Execute(ctx)
}
