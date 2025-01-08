package usecase

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/blockchain/hdkeystore"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/security/securestring"
)

type EncryptWalletUseCase struct {
	logger   *slog.Logger
	keystore hdkeystore.KeystoreAdapter
}

func NewEncryptWalletUseCase(
	logger *slog.Logger,
	keystore hdkeystore.KeystoreAdapter,
) *EncryptWalletUseCase {
	return &EncryptWalletUseCase{logger, keystore}
}

func (uc *EncryptWalletUseCase) Execute(ctx context.Context, mnemonic *sstring.SecureString, path string, password *sstring.SecureString) ([]byte, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if mnemonic == nil {
		e["mnemonic"] = "missing value"
	}
	if path == "" {
		e["path"] = "missing value"
	}
	if password == nil {
		e["password"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2:
	//

	return uc.keystore.EncryptWallet(mnemonic, path, password)
}
