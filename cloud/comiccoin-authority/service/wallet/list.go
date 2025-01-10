package wallet

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"
	uc_wallet "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/wallet"
)

type WalletListService interface {
	Execute(ctx context.Context) ([]*domain.Wallet, error)
}

type walletListServiceImpl struct {
	config               *config.Configuration
	logger               *slog.Logger
	listAllWalletUseCase uc_wallet.ListAllWalletUseCase
}

func NewWalletListService(
	cfg *config.Configuration,
	logger *slog.Logger,
	uc uc_wallet.ListAllWalletUseCase,
) WalletListService {
	return &walletListServiceImpl{cfg, logger, uc}
}

func (s *walletListServiceImpl) Execute(ctx context.Context) ([]*domain.Wallet, error) {
	return s.listAllWalletUseCase.Execute(ctx)
}
