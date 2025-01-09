package walletutil

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/ethereum/go-ethereum/accounts"
	hdwallet "github.com/miguelmota/go-ethereum-hdwallet"

	hdkeystore "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/blockchain/hdkeystore"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/security/securestring"
)

type OpenHDWalletFromMnemonicUseCase struct {
	logger   *slog.Logger
	keystore hdkeystore.KeystoreAdapter
}

func NewOpenHDWalletFromMnemonicUseCase(
	logger *slog.Logger,
	keystore hdkeystore.KeystoreAdapter,
) *OpenHDWalletFromMnemonicUseCase {
	return &OpenHDWalletFromMnemonicUseCase{logger, keystore}
}

func (uc *OpenHDWalletFromMnemonicUseCase) Execute(ctx context.Context, mnemonic *sstring.SecureString, path string) (*accounts.Account, *hdwallet.Wallet, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if mnemonic == nil {
		e["mnemonic"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed reading wallet private key",
			slog.Any("error", e))
		return nil, nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Decrypt key
	//

	ethereumAccount, wallet, err := uc.keystore.OpenWallet(mnemonic, path)
	if err != nil {
		uc.logger.Warn("Failed getting wallet key",
			slog.Any("error", err))
		return nil, nil, httperror.NewForBadRequestWithSingleField("message", fmt.Sprintf("failed getting wallet private key: %v", err))
	}

	return &ethereumAccount, wallet, nil
}
