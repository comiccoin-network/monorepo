package usecase

import (
	"context"
	"log/slog"

	hdkeystore "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/blockchain/hdkeystore"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/security/securestring"
)

type DecryptWalletMnemonicPhraseUseCase struct {
	logger   *slog.Logger
	keystore hdkeystore.KeystoreAdapter
}

func NewDecryptWalletMnemonicPhraseUseCase(
	logger *slog.Logger,
	keystore hdkeystore.KeystoreAdapter,
) *DecryptWalletMnemonicPhraseUseCase {
	return &DecryptWalletMnemonicPhraseUseCase{logger, keystore}
}

func (uc *DecryptWalletMnemonicPhraseUseCase) Execute(ctx context.Context, cryptData []byte, password *sstring.SecureString) (*sstring.SecureString, string, error) {
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
		return nil, "", httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Decrypt
	//

	return uc.keystore.DecryptMnemonicPhrase(cryptData, password)
}
