package account

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/domain"
)

type GetAccountsHashStateUseCase interface {
	Execute(ctx context.Context, chainID uint16) (string, error)
}

type getAccountsHashStateUseCaseImpl struct {
	logger *slog.Logger
	repo   domain.AccountRepository
}

func NewGetAccountsHashStateUseCase(logger *slog.Logger, repo domain.AccountRepository) GetAccountsHashStateUseCase {
	return &getAccountsHashStateUseCaseImpl{logger, repo}
}

func (uc *getAccountsHashStateUseCaseImpl) Execute(ctx context.Context, chainID uint16) (string, error) {
	return uc.repo.HashStateByChainID(ctx, chainID)
}
