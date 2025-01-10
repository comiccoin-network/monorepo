package token

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/domain"
)

type GetTokensHashStateUseCase interface {
	Execute(ctx context.Context, chainID uint16) (string, error)
}

type getTokensHashStateUseCaseImpl struct {
	logger *slog.Logger
	repo   domain.TokenRepository
}

func NewGetTokensHashStateUseCase(logger *slog.Logger, repo domain.TokenRepository) GetTokensHashStateUseCase {
	return &getTokensHashStateUseCaseImpl{logger, repo}
}

func (uc *getTokensHashStateUseCaseImpl) Execute(ctx context.Context, chainID uint16) (string, error) {
	return uc.repo.HashStateByChainID(ctx, chainID)
}
