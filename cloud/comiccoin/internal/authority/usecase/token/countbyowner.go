package token

import (
	"context"
	"log/slog"

	"github.com/ethereum/go-ethereum/common"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/domain"
)

type CountTokensByOwnerUseCase interface {
	Execute(ctx context.Context, owner *common.Address) (int, error)
}

type countTokensByOwnerUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   domain.TokenRepository
}

func NewCountTokensByOwnerUseCase(config *config.Configuration, logger *slog.Logger, repo domain.TokenRepository) CountTokensByOwnerUseCase {
	return &countTokensByOwnerUseCaseImpl{config, logger, repo}
}

func (uc *countTokensByOwnerUseCaseImpl) Execute(ctx context.Context, owner *common.Address) (int, error) {
	toks, err := uc.repo.ListByOwner(ctx, owner)
	if err != nil {
		return 0, err
	}
	return len(toks), nil
}
