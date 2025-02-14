package walletutil

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/ethereum/go-ethereum/accounts"
	hdwallet "github.com/miguelmota/go-ethereum-hdwallet"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/blockchain/hdkeystore"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/securestring"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
)

type OpenHDWalletFromMnemonicUseCase interface {
	Execute(ctx context.Context, mnemonic *sstring.SecureString, path string) (*accounts.Account, *hdwallet.Wallet, error)
}

type openHDWalletFromMnemonicUseCaseImpl struct {
	config   *config.Configuration
	logger   *slog.Logger
	keystore hdkeystore.KeystoreAdapter
}

func NewOpenHDWalletFromMnemonicUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	keystore hdkeystore.KeystoreAdapter,
) OpenHDWalletFromMnemonicUseCase {
	return &openHDWalletFromMnemonicUseCaseImpl{config, logger, keystore}
}

func (uc *openHDWalletFromMnemonicUseCaseImpl) Execute(ctx context.Context, mnemonic *sstring.SecureString, path string) (*accounts.Account, *hdwallet.Wallet, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if mnemonic == nil {
		e["mnemonic"] = "Mnemonic is required"
	}
	if path == "" {
		e["path"] = "Path is required"
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed reading wallet key",
			slog.Any("error", e))
		return nil, nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Create the wallet from mnemonic phrase.
	//

	uc.logger.Debug("Creating wallet...")

	ethereumAccount, wallet, err := uc.keystore.OpenWallet(mnemonic, path)
	if err != nil {
		uc.logger.Error("failed creating new keystore",
			slog.Any("error", err))
		return nil, nil, fmt.Errorf("failed creating new keystore: %s", err)
	}

	uc.logger.Debug("New wallet created", slog.Any("ethereum_account", ethereumAccount))

	return &ethereumAccount, wallet, nil
}
