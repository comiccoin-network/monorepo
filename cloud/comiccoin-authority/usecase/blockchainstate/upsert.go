package blockchainstate

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"
)

type UpsertBlockchainStateUseCase interface {
	Execute(ctx context.Context, bcs *domain.BlockchainState) error
}

type upsertBlockchainStateUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   domain.BlockchainStateRepository
}

func NewUpsertBlockchainStateUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo domain.BlockchainStateRepository,
) UpsertBlockchainStateUseCase {
	return &upsertBlockchainStateUseCaseImpl{config, logger, repo}
}

func (uc *upsertBlockchainStateUseCaseImpl) Execute(ctx context.Context, bcs *domain.BlockchainState) error {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if bcs == nil {
		e["blockchain_state"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed upserting blockchain state",
			slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	//
	// STEP 3: Insert into database.
	//

	return uc.repo.UpsertByChainID(ctx, bcs)
}
