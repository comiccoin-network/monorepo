package walletutil

import (
	"context"
	"fmt"
	"log/slog"

	hdkeystore "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/blockchain/hdkeystore"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/security/securestring"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/config"
)

type MnemonicFromEncryptedWalletUseCase interface {
	Execute(ctx context.Context, encryptedWalletBytes []byte, password *sstring.SecureString) (*sstring.SecureString, string, error)
}

type mnemonicFromEncryptedWalletUseCaseImpl struct {
	config   *config.Configuration
	logger   *slog.Logger
	keystore hdkeystore.KeystoreAdapter
}

func NewMnemonicFromEncryptedWalletUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	keystore hdkeystore.KeystoreAdapter,
) MnemonicFromEncryptedWalletUseCase {
	return &mnemonicFromEncryptedWalletUseCaseImpl{config, logger, keystore}
}

func (uc *mnemonicFromEncryptedWalletUseCaseImpl) Execute(ctx context.Context, encryptedWalletBytes []byte, password *sstring.SecureString) (*sstring.SecureString, string, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if encryptedWalletBytes == nil {
		e["encryptedWalletBytes"] = "Encrypted wallet data is required"
	}
	if password == nil {
		e["password"] = "Password is required"
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed validating",
			slog.Any("error", e))
		return nil, "", httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Decrypt key
	//

	mnemonic, path, err := uc.keystore.MnemonicFromEncryptedWallet(encryptedWalletBytes, password)
	if err != nil {
		uc.logger.Warn("Failed getting wallet key",
			slog.Any("error", err))
		return nil, "", httperror.NewForBadRequestWithSingleField("message", fmt.Sprintf("failed decrypting mnemonic from wallet : %v", err))
	}

	return mnemonic, path, nil
}
