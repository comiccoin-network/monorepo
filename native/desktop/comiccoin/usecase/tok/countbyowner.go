package tok

import (
	"context"
	"log/slog"

	"github.com/ethereum/go-ethereum/common"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"
)

type CountTokensByOwnerUseCase interface {
	Execute(ctx context.Context, owner *common.Address) (int64, error)
}

type countTokensByOwnerUseCaseImpl struct {
	logger *slog.Logger
	repo   domain.TokenRepository
}

func NewCountTokensByOwnerUseCase(logger *slog.Logger, repo domain.TokenRepository) CountTokensByOwnerUseCase {
	return &countTokensByOwnerUseCaseImpl{logger, repo}
}

func (uc *countTokensByOwnerUseCaseImpl) Execute(ctx context.Context, owner *common.Address) (int64, error) {
	counter, err := uc.repo.CountByOwner(ctx, owner)
	if err != nil {
		return 0, err
	}
	return counter, nil
}
