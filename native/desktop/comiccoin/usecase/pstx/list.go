package pstx

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/native/desktop/comiccoin/domain"
)

type ListPendingSignedTransactionUseCase interface {
	Execute(ctx context.Context) ([]*domain.PendingSignedTransaction, error)
}

type listPendingSignedTransactionUseCaseImpl struct {
	logger *slog.Logger
	repo   domain.PendingSignedTransactionRepository
}

func NewListPendingSignedTransactionUseCase(logger *slog.Logger, repo domain.PendingSignedTransactionRepository) ListPendingSignedTransactionUseCase {
	return &listPendingSignedTransactionUseCaseImpl{logger, repo}
}

func (uc *listPendingSignedTransactionUseCaseImpl) Execute(ctx context.Context) ([]*domain.PendingSignedTransaction, error) {
	return uc.repo.ListAll()
}
