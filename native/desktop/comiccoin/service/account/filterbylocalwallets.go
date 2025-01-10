package account

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"

	uc_account "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/usecase/account"
	uc_wallet "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/usecase/wallet"
)

type AccountListingByLocalWalletsService struct {
	logger                           *slog.Logger
	listAllAddressesWalletUseCase    *uc_wallet.ListAllAddressesWalletUseCase
	accountsFilterByAddressesUseCase uc_account.AccountsFilterByAddressesUseCase
}

func NewAccountListingByLocalWalletsService(
	logger *slog.Logger,
	uc1 *uc_wallet.ListAllAddressesWalletUseCase,
	uc2 uc_account.AccountsFilterByAddressesUseCase,
) *AccountListingByLocalWalletsService {
	return &AccountListingByLocalWalletsService{logger, uc1, uc2}
}

func (s *AccountListingByLocalWalletsService) Execute(ctx context.Context) ([]*domain.Account, error) {
	myAccountAddresses, err := s.listAllAddressesWalletUseCase.Execute(ctx)
	if err != nil {
		s.logger.Error("Failed listing all wallet addresses",
			slog.Any("error", err))
		return nil, err
	}

	// If we have no local wallets then return an empty list.
	if myAccountAddresses == nil || len(myAccountAddresses) == 0 {
		return make([]*domain.Account, 0), nil
	}

	myAccounts, err := s.accountsFilterByAddressesUseCase.Execute(ctx, myAccountAddresses)
	if err != nil {
		s.logger.Error("Failed listing all my accounts",
			slog.Any("error", err))
		return nil, err
	}

	return myAccounts, nil
}
