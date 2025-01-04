package wallet

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/domain"
)

type ListAllWalletUseCase struct {
	config *config.Configuration
	logger *slog.Logger
	repo   domain.WalletRepository
}

func NewListAllWalletUseCase(config *config.Configuration, logger *slog.Logger, repo domain.WalletRepository) *ListAllWalletUseCase {
	return &ListAllWalletUseCase{config, logger, repo}
}

func (uc *ListAllWalletUseCase) Execute(ctx context.Context) ([]*domain.Wallet, error) {
	return uc.repo.ListAll(ctx)
}
