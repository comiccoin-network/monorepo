package tok

import (
	"context"
	"log/slog"

	"github.com/ethereum/go-ethereum/common"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"
)

type ListTokensByOwnerUseCase interface {
	Execute(ctx context.Context, owner *common.Address) ([]*domain.Token, error)
}

type listTokensByOwnerUseCaseImpl struct {
	logger *slog.Logger
	repo   domain.TokenRepository
}

func NewListTokensByOwnerUseCase(logger *slog.Logger, repo domain.TokenRepository) ListTokensByOwnerUseCase {
	return &listTokensByOwnerUseCaseImpl{logger, repo}
}

func (uc *listTokensByOwnerUseCaseImpl) Execute(ctx context.Context, owner *common.Address) ([]*domain.Token, error) {
	return uc.repo.ListByOwner(ctx, owner)
}
