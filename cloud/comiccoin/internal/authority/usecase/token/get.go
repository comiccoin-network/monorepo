package token

import (
	"context"
	"log/slog"
	"math/big"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/domain"
)

type GetTokenUseCase interface {
	Execute(ctx context.Context, tokenID *big.Int) (*domain.Token, error)
}

type getTokenUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   domain.TokenRepository
}

func NewGetTokenUseCase(config *config.Configuration, logger *slog.Logger, repo domain.TokenRepository) GetTokenUseCase {
	return &getTokenUseCaseImpl{config, logger, repo}
}

func (uc *getTokenUseCaseImpl) Execute(ctx context.Context, tokenID *big.Int) (*domain.Token, error) {
	return uc.repo.GetByID(ctx, tokenID)
}
