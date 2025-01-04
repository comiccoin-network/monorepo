package token

import (
	"context"
	"log/slog"
	"math/big"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/domain"
)

//
// Copied from `github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase`
//

type GetTokenUseCase struct {
	logger *slog.Logger
	repo   domain.TokenRepository
}

func NewGetTokenUseCase(logger *slog.Logger, repo domain.TokenRepository) *GetTokenUseCase {
	return &GetTokenUseCase{logger, repo}
}

func (uc *GetTokenUseCase) Execute(ctx context.Context, tokenID *big.Int) (*domain.Token, error) {
	return uc.repo.GetByID(ctx, tokenID)
}