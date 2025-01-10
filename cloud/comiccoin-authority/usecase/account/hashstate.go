package account

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"
)

type GetAccountsHashStateUseCase interface {
	Execute(ctx context.Context, chainID uint16) (string, error)
}

type getAccountsHashStateUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   domain.AccountRepository
}

func NewGetAccountsHashStateUseCase(config *config.Configuration, logger *slog.Logger, repo domain.AccountRepository) GetAccountsHashStateUseCase {
	return &getAccountsHashStateUseCaseImpl{config, logger, repo}
}

func (uc *getAccountsHashStateUseCaseImpl) Execute(ctx context.Context, chainID uint16) (string, error) {
	return uc.repo.HashStateByChainID(ctx, chainID)
}
