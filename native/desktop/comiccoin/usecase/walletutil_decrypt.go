package usecase

import (
	"context"
	"log/slog"

	"github.com/ethereum/go-ethereum/accounts"
	hdwallet "github.com/miguelmota/go-ethereum-hdwallet"

	hdkeystore "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/blockchain/hdkeystore"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/security/securestring"
)

type DecryptWalletUseCase struct {
	logger   *slog.Logger
	keystore hdkeystore.KeystoreAdapter
}

func NewDecryptWalletUseCase(
	logger *slog.Logger,
	keystore hdkeystore.KeystoreAdapter,
) *DecryptWalletUseCase {
	return &DecryptWalletUseCase{logger, keystore}
}

func (uc *DecryptWalletUseCase) Execute(ctx context.Context, cryptData []byte, password *sstring.SecureString) (accounts.Account, *hdwallet.Wallet, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if cryptData == nil {
		e["crypt_data"] = "missing value"
	}
	if password == nil {
		e["password"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed",
			slog.Any("error", e))
		return accounts.Account{}, nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Decrypt
	//

	return uc.keystore.DecryptWallet(cryptData, password)
}
