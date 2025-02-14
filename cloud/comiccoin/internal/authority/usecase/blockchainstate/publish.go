package blockchainstate

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/storage/memory/redis"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/domain"
)

type BlockchainStatePublishUseCase interface {
	Execute(ctx context.Context, bcState *domain.BlockchainState) error
}

type blockchainStatePublishUseCaseImpl struct {
	logger *slog.Logger
	cache  redis.Cacher
}

func NewBlockchainStatePublishUseCase(
	logger *slog.Logger,
	cache redis.Cacher,
) BlockchainStatePublishUseCase {
	return &blockchainStatePublishUseCaseImpl{logger, cache}
}

func (uc *blockchainStatePublishUseCaseImpl) Execute(ctx context.Context, bcState *domain.BlockchainState) error {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if bcState == nil {
		e["blockchain_state"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed validating blockchain state",
			slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Publish to Redis.
	//

	bcStateBin, err := bcState.Serialize()
	if err != nil {
		uc.logger.Error("failed serializing publish to blockchain state", slog.Any("error", err))
		return err
	}

	if err := uc.cache.Publish(ctx, "blockchain_state", bcStateBin); err != nil {
		uc.logger.Error("failed publishing blockchain state", slog.Any("error", err))
		return err
	}
	uc.logger.Debug("Publishing latest blockchain to redis",
		slog.Any("chain_id", bcState.ChainID))
	return nil
}
