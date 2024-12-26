package usecase

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/domain"
)

//
// Copied from `github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase`
//

type GetAccountsHashStateUseCase struct {
	logger *slog.Logger
	repo   domain.AccountRepository
}

func NewGetAccountsHashStateUseCase(logger *slog.Logger, repo domain.AccountRepository) *GetAccountsHashStateUseCase {
	return &GetAccountsHashStateUseCase{logger, repo}
}

func (uc *GetAccountsHashStateUseCase) Execute(ctx context.Context, chainID uint16) (string, error) {
	return uc.repo.HashStateByChainID(ctx, chainID)
}
