package wallet

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/domain"
)

type ListAllWalletUseCase interface {
	Execute(ctx context.Context) ([]*domain.Wallet, error)
}

type listAllWalletUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   domain.WalletRepository
}

func NewListAllWalletUseCase(config *config.Configuration, logger *slog.Logger, repo domain.WalletRepository) ListAllWalletUseCase {
	return &listAllWalletUseCaseImpl{config, logger, repo}
}

func (uc *listAllWalletUseCaseImpl) Execute(ctx context.Context) ([]*domain.Wallet, error) {
	return uc.repo.ListAll(ctx)
}
