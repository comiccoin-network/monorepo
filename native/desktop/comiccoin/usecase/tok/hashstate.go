package tok

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"
)

type GetTokensHashStateUseCase struct {
	config *config.Configuration
	logger *slog.Logger
	repo   domain.TokenRepository
}

func NewGetTokensHashStateUseCase(config *config.Configuration, logger *slog.Logger, repo domain.TokenRepository) *GetTokensHashStateUseCase {
	return &GetTokensHashStateUseCase{config, logger, repo}
}

func (uc *GetTokensHashStateUseCase) Execute(ctx context.Context, chainID uint16) (string, error) {
	return uc.repo.HashStateByChainID(ctx, chainID)
}
