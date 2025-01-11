package walletutil

import (
	"context"
	"crypto/ecdsa"
	"fmt"
	"log/slog"

	hdkeystore "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/blockchain/hdkeystore"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/security/securestring"
)

type PrivateKeyFromHDWalletUseCase interface {
	Execute(ctx context.Context, mnemonic *sstring.SecureString, path string) (*ecdsa.PrivateKey, error)
}

type privateKeyFromHDWalletUseCaseImpl struct {
	logger   *slog.Logger
	keystore hdkeystore.KeystoreAdapter
}

func NewPrivateKeyFromHDWalletUseCase(
	logger *slog.Logger,
	keystore hdkeystore.KeystoreAdapter,
) PrivateKeyFromHDWalletUseCase {
	return &privateKeyFromHDWalletUseCaseImpl{logger, keystore}
}

func (uc *privateKeyFromHDWalletUseCaseImpl) Execute(ctx context.Context, mnemonic *sstring.SecureString, path string) (*ecdsa.PrivateKey, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if mnemonic == nil {
		e["mnemonic"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed reading wallet key",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Decrypt key
	//

	pk, err := uc.keystore.PrivateKeyFromOpenWallet(mnemonic, path)
	if err != nil {
		uc.logger.Warn("Failed getting wallet private key",
			slog.Any("error", err))
		return nil, httperror.NewForBadRequestWithSingleField("message", fmt.Sprintf("failed getting wallet private key: %v", err))
	}

	return pk, nil
}
