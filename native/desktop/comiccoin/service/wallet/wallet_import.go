package wallet

import (
	"context"
	"fmt"
	"io/ioutil"
	"log/slog"
	"math/big"
	"strings"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"

	uc_account "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/usecase/account"
	uc_wallet "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/usecase/wallet"
)

type ImportWalletService struct {
	logger               *slog.Logger
	getAccountUseCase    uc_account.GetAccountUseCase
	getWalletUseCase     *uc_wallet.GetWalletUseCase
	upsertAccountUseCase uc_account.UpsertAccountUseCase
	createWalletUseCase  *uc_wallet.CreateWalletUseCase
}

func NewImportWalletService(
	logger *slog.Logger,
	uc1 uc_account.GetAccountUseCase,
	uc2 *uc_wallet.GetWalletUseCase,
	uc3 uc_account.UpsertAccountUseCase,
	uc4 *uc_wallet.CreateWalletUseCase,
) *ImportWalletService {
	return &ImportWalletService{logger, uc1, uc2, uc3, uc4}
}

func (s *ImportWalletService) Execute(ctx context.Context, filepath string) error {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if filepath == "" {
		e["filepath"] = "missing value"
	}
	if len(e) != 0 {
		s.logger.Warn("Validation failed",
			slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	s.logger.Debug("beginning to import wallet...",
		slog.Any("filepath", filepath))

	//
	// STEP 2: Open the file and unmarshal into our datastructure.
	//

	fileBytes, err := ioutil.ReadFile(filepath)
	if err != nil {
		s.logger.Error("failed reading a file",
			slog.Any("filepath", filepath),
			slog.Any("error", err))
		return err
	}

	wallet, err := domain.NewWalletFromDeserialize(fileBytes)
	if err != nil {
		s.logger.Error("failed unmarshalling a file",
			slog.Any("filepath", filepath),
			slog.Any("error", err))
		return err
	}

	s.logger.Debug("opened wallet...",
		slog.Any("wallet", wallet))

	//
	// STEP 3:
	// Get our account from our database if it exists and if not no account
	// exists then we need to create it now.
	//

	account, err := s.getAccountUseCase.Execute(ctx, wallet.Address)
	if err != nil {
		if !strings.Contains(err.Error(), "does not exist") {
			s.logger.Error("failed getting account",
				slog.Any("filepath", filepath),
				slog.Any("error", err))
			return err
		}
	}
	if account == nil {
		s.logger.Debug("account d.n.e. so creating now...")
		if err := s.upsertAccountUseCase.Execute(ctx, wallet.Address, 0, big.NewInt(0)); err != nil {
			s.logger.Error("Failed upserting wallet account.",
				slog.Any("error", err))
			return err
		}
		s.logger.Debug("account created.")
	} else {
		walletInDB, err := s.getWalletUseCase.Execute(ctx, account.Address)
		if err != nil {
			if !strings.Contains(err.Error(), "does not exist") {
				s.logger.Error("failed getting account",
					slog.Any("error", err))
				return err
			}
		}
		if walletInDB != nil {
			err := fmt.Errorf("Wallet already exists for address: %v", walletInDB.Address)
			s.logger.Error("Wallet already exists",
				slog.Any("error", err))
			return err
		}
	}

	if err := s.createWalletUseCase.Execute(ctx, wallet.Address, wallet.KeystoreBytes, wallet.Label); err != nil {
		s.logger.Error("failed saving to database",
			slog.Any("error", err))
		return fmt.Errorf("failed saving to database: %s", err)
	}

	s.logger.Debug("imported wallet",
		slog.Any("address", wallet.Address),
		slog.Any("filepath", filepath))

	return nil
}
