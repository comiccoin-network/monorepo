package tok

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"
)

type GetTokensHashStateUseCase interface {
	Execute(ctx context.Context, chainID uint16) (string, error)
}

type getTokensHashStateUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   domain.TokenRepository
}

func NewGetTokensHashStateUseCase(config *config.Configuration, logger *slog.Logger, repo domain.TokenRepository) GetTokensHashStateUseCase {
	return &getTokensHashStateUseCaseImpl{config, logger, repo}
}

func (uc *getTokensHashStateUseCaseImpl) Execute(ctx context.Context, chainID uint16) (string, error) {
	return uc.repo.HashStateByChainID(ctx, chainID)
}
