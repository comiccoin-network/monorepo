package token

import (
	"context"
	"log/slog"
	"math/big"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/domain"
)

type GetTokenUseCase interface {
	Execute(ctx context.Context, tokenID *big.Int) (*domain.Token, error)
}

type getTokenUseCaseImpl struct {
	logger *slog.Logger
	repo   domain.TokenRepository
}

func NewGetTokenUseCase(logger *slog.Logger, repo domain.TokenRepository) GetTokenUseCase {
	return &getTokenUseCaseImpl{logger, repo}
}

func (uc *getTokenUseCaseImpl) Execute(ctx context.Context, tokenID *big.Int) (*domain.Token, error) {
	return uc.repo.GetByID(ctx, tokenID)
}
