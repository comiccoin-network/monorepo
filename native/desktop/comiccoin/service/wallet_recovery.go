package service

import (
	"context"
	"fmt"
	"log/slog"
	"strings"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/security/securestring"
	"github.com/ethereum/go-ethereum/common"

	"github.com/comiccoin-network/monorepo/native/desktop/comiccoin/usecase"
	uc_walletutil "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/usecase/walletutil"
)

type WalletRecoveryService struct {
	logger                               *slog.Logger
	getWalletUseCase                     *usecase.GetWalletUseCase
	mnemonicFromEncryptedHDWalletUseCase *uc_walletutil.MnemonicFromEncryptedHDWalletUseCase
}

func NewWalletRecoveryService(
	logger *slog.Logger,
	uc1 *usecase.GetWalletUseCase,
	uc2 *uc_walletutil.MnemonicFromEncryptedHDWalletUseCase,
) *WalletRecoveryService {
	return &WalletRecoveryService{logger, uc1, uc2}
}

func (s *WalletRecoveryService) Execute(ctx context.Context, address *common.Address, password *sstring.SecureString) (*sstring.SecureString, string, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if address == nil {
		e["address"] = "Address is required"
	}
	if password == nil {
		e["password"] = "Password is required"
	}
	if len(e) != 0 {
		s.logger.Warn("Validation failed for getting account",
			slog.Any("error", e))
		return nil, "", httperror.NewForBadRequest(&e)
	}

	s.logger.Debug("Beginning wallet recovery...",
		slog.Any("address", address))

	//
	// STEP 2: Get our wallet.
	//

	wallet, err := s.getWalletUseCase.Execute(ctx, address)
	if err != nil {
		if !strings.Contains(err.Error(), "does not exist") {
			s.logger.Error("failed getting account",
				slog.Any("address", address),
				slog.Any("error", err))
			return nil, "", err
		}
	}
	if wallet == nil {
		err := fmt.Errorf("Wallet d.n.e. for address: %v", address)
		s.logger.Error("Wallet d.n.e.",
			slog.Any("error", err))
		return nil, "", err
	}

	//
	// STEP 3: Decrypt it.
	//

	mn, path, err := s.mnemonicFromEncryptedHDWalletUseCase.Execute(ctx, wallet.KeystoreBytes, password)
	if err != nil {
		s.logger.Error("failed decrypting wallet",
			slog.Any("address", address),
			slog.Any("error", err))
		return nil, "", err
	}

	return mn, path, nil
}
