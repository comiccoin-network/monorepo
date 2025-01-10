package token

import (
	"context"
	"log/slog"

	"github.com/ethereum/go-ethereum/common"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"
)

type ListTokensByOwnerUseCase interface {
	Execute(ctx context.Context, owner *common.Address) ([]*domain.Token, error)
}

type listTokensByOwnerUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   domain.TokenRepository
}

func NewListTokensByOwnerUseCase(config *config.Configuration, logger *slog.Logger, repo domain.TokenRepository) ListTokensByOwnerUseCase {
	return &listTokensByOwnerUseCaseImpl{config, logger, repo}
}

func (uc *listTokensByOwnerUseCaseImpl) Execute(ctx context.Context, owner *common.Address) ([]*domain.Token, error) {
	return uc.repo.ListByOwner(ctx, owner)
}
