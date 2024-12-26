package usecase

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/domain"
)

//
// Copied from `github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase`
//

type GetTokensHashStateUseCase struct {
	logger *slog.Logger
	repo   domain.TokenRepository
}

func NewGetTokensHashStateUseCase(logger *slog.Logger, repo domain.TokenRepository) *GetTokensHashStateUseCase {
	return &GetTokensHashStateUseCase{logger, repo}
}

func (uc *GetTokensHashStateUseCase) Execute(ctx context.Context, chainID uint16) (string, error) {
	return uc.repo.HashStateByChainID(ctx, chainID)
}
