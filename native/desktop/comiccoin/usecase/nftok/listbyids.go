package nftok

import (
	"context"
	"log/slog"
	"math/big"

	"github.com/comiccoin-network/monorepo/native/desktop/comiccoin/domain"
)

type ListNonFungibleTokensWithFilterByTokenIDsyUseCase interface {
	Execute(ctx context.Context, tokIDs []*big.Int) ([]*domain.NonFungibleToken, error)
}

type listNonFungibleTokensWithFilterByTokenIDsyUseCaseImpl struct {
	logger *slog.Logger
	repo   domain.NonFungibleTokenRepository
}

func NewListNonFungibleTokensWithFilterByTokenIDsyUseCase(logger *slog.Logger, repo domain.NonFungibleTokenRepository) ListNonFungibleTokensWithFilterByTokenIDsyUseCase {
	return &listNonFungibleTokensWithFilterByTokenIDsyUseCaseImpl{logger, repo}
}

func (uc *listNonFungibleTokensWithFilterByTokenIDsyUseCaseImpl) Execute(ctx context.Context, tokIDs []*big.Int) ([]*domain.NonFungibleToken, error) {
	return uc.repo.ListWithFilterByTokenIDs(tokIDs)
}
