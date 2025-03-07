package wallet

import (
	"context"
	"fmt"
	"io/ioutil"
	"log/slog"
	"strings"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	"github.com/ethereum/go-ethereum/common"

	uc_account "github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/usecase/account"
	uc_wallet "github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/usecase/wallet"
)

type ExportWalletService interface {
	Execute(ctx context.Context, address *common.Address, filepath string) error
}

type exportWalletServiceImpl struct {
	logger            *slog.Logger
	getAccountUseCase uc_account.GetAccountUseCase
	getWalletUseCase  uc_wallet.GetWalletUseCase
}

func NewExportWalletService(
	logger *slog.Logger,
	uc1 uc_account.GetAccountUseCase,
	uc2 uc_wallet.GetWalletUseCase,
) ExportWalletService {
	return &exportWalletServiceImpl{logger, uc1, uc2}
}

func (s *exportWalletServiceImpl) Execute(ctx context.Context, address *common.Address, filepath string) error {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if address == nil {
		e["address"] = "missing value"
	}
	if filepath == "" {
		e["filepath"] = "missing value"
	}
	if len(e) != 0 {
		s.logger.Warn("Validation failed for getting account",
			slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	s.logger.Debug("beginning to exported wallet...",
		slog.Any("address", address),
		slog.Any("filepath", filepath))

	//
	// STEP 2: Get our account from our in-memory database if it exists.
	//

	account, err := s.getAccountUseCase.Execute(ctx, address)
	if err != nil {
		if !strings.Contains(err.Error(), "does not exist") {
			s.logger.Error("failed getting account",
				slog.Any("address", address),
				slog.Any("error", err))
			return err
		}
	}
	if account == nil {
		err := fmt.Errorf("Account d.n.e. for address: %v", address)
		s.logger.Error("Account d.n.e.",
			slog.Any("error", err))
		return err
	}

	wallet, err := s.getWalletUseCase.Execute(ctx, account.Address)
	if err != nil {
		if !strings.Contains(err.Error(), "does not exist") {
			s.logger.Error("failed getting account",
				slog.Any("address", address),
				slog.Any("error", err))
			return err
		}
	}
	if wallet == nil {
		err := fmt.Errorf("Wallet d.n.e. for address: %v", address)
		s.logger.Error("Wallet d.n.e.",
			slog.Any("error", err))
		return err
	}

	walletBytes, err := wallet.Serialize()
	if err != nil {
		s.logger.Error("failed serializing",
			slog.Any("address", address),
			slog.Any("error", err))
		return err
	}

	// write the whole body at once
	if err = ioutil.WriteFile(filepath, walletBytes, 0644); err != nil {
		s.logger.Error("failed saving to file",
			slog.Any("address", address),
			slog.Any("error", err))
		return err
	}

	s.logger.Debug("exported wallet",
		slog.Any("address", address),
		slog.Any("filepath", filepath))

	return nil
}
