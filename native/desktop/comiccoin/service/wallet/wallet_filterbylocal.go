package wallet

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"

	uc_wallet "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/usecase/wallet"
)

type WalletsFilterByLocalService struct {
	logger               *slog.Logger
	listAllWalletUseCase uc_wallet.ListAllWalletUseCase
}

func NewWalletsFilterByLocalService(
	logger *slog.Logger,
	uc1 uc_wallet.ListAllWalletUseCase,
) *WalletsFilterByLocalService {
	return &WalletsFilterByLocalService{logger, uc1}
}

func (s *WalletsFilterByLocalService) Execute(ctx context.Context) ([]*domain.Wallet, error) {
	myLocalWallets, err := s.listAllWalletUseCase.Execute(ctx)
	if err != nil {
		s.logger.Error("Failed listing all wallet addresses",
			slog.Any("error", err))
		return nil, err
	}

	// If we have no local wallets then return an empty list.
	if myLocalWallets == nil || len(myLocalWallets) == 0 {
		return make([]*domain.Wallet, 0), nil
	}

	return myLocalWallets, nil
}
