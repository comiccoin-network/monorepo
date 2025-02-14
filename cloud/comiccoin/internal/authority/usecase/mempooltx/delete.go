package mempooltx

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/domain"
)

type MempoolTransactionDeleteByIDUseCase interface {
	Execute(ctx context.Context, id primitive.ObjectID) error
}

type mempoolTransactionDeleteByIDUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   domain.MempoolTransactionRepository
}

func NewMempoolTransactionDeleteByIDUseCase(config *config.Configuration, logger *slog.Logger, repo domain.MempoolTransactionRepository) MempoolTransactionDeleteByIDUseCase {
	return &mempoolTransactionDeleteByIDUseCaseImpl{config, logger, repo}
}

func (uc *mempoolTransactionDeleteByIDUseCaseImpl) Execute(ctx context.Context, id primitive.ObjectID) error {
	//
	// STEP 1: Validation.
	// Note: `headerSignature` is optional since PoW algorithm does not require it
	// the PoA algorithm requires it.

	e := make(map[string]string)
	if id.IsZero() {
		e["id"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed validating",
			slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Execution in database.
	//
	err := uc.repo.DeleteByID(ctx, id)
	if err != nil {
		uc.logger.Error("Failed deleting mempool transaction",
			slog.Any("error", err))
		return err
	}
	return nil
}
