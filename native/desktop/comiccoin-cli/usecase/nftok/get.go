package nftok

import (
	"context"
	"log/slog"
	"math/big"

	"github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/domain"
)

type GetNonFungibleTokenUseCase interface {
	Execute(ctx context.Context, tokenID *big.Int) (*domain.NonFungibleToken, error)
}

type getNonFungibleTokenUseCaseImpl struct {
	logger *slog.Logger
	repo   domain.NonFungibleTokenRepository
}

func NewGetNonFungibleTokenUseCase(logger *slog.Logger, repo domain.NonFungibleTokenRepository) GetNonFungibleTokenUseCase {
	return &getNonFungibleTokenUseCaseImpl{logger, repo}
}

func (uc *getNonFungibleTokenUseCaseImpl) Execute(ctx context.Context, tokenID *big.Int) (*domain.NonFungibleToken, error) {
	return uc.repo.GetByTokenID(tokenID)
}
