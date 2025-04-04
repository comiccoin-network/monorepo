package pstx

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"

	"github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/domain"
)

type UpsertPendingSignedTransactionUseCase interface {
	Execute(ctx context.Context, pstx *domain.PendingSignedTransaction) error
}

type upsertPendingSignedTransactionUseCaseImpl struct {
	logger *slog.Logger
	repo   domain.PendingSignedTransactionRepository
}

func NewUpsertPendingSignedTransactionUseCase(logger *slog.Logger, repo domain.PendingSignedTransactionRepository) UpsertPendingSignedTransactionUseCase {
	return &upsertPendingSignedTransactionUseCaseImpl{logger, repo}
}

func (uc *upsertPendingSignedTransactionUseCaseImpl) Execute(ctx context.Context, pstx *domain.PendingSignedTransaction) error {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if pstx == nil {
		e["pending_signed_transaction"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed validating",
			slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Insert into database.
	//

	return uc.repo.Upsert(pstx)
}
