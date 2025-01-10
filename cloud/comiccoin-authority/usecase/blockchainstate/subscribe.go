package blockchainstate

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/storage/memory/redis"
)

type BlockchainStateSubscribeUseCase interface {
	Execute(ctx context.Context) redis.RedisSubscriber
}

type blockchainStateSubscribeUseCaseImpl struct {
	logger *slog.Logger
	cache  redis.Cacher
}

func NewBlockchainStateSubscribeUseCase(
	logger *slog.Logger,
	cache redis.Cacher,
) BlockchainStateSubscribeUseCase {
	return &blockchainStateSubscribeUseCaseImpl{logger, cache}
}

func (uc *blockchainStateSubscribeUseCaseImpl) Execute(ctx context.Context) redis.RedisSubscriber {
	return uc.cache.Subscribe(ctx, "blockchain_state")
}
