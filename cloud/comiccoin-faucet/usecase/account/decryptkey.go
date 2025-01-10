package account

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/ethereum/go-ethereum/accounts/keystore"

	pkgkeystore "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/blockchain/keystore"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/httperror"
	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/security/securestring"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/domain"
)

type AccountDecryptKeyUseCase interface {
	Execute(ctx context.Context, walletKeystoreBytes []byte, walletPassword *sstring.SecureString) (*keystore.Key, error)
}

//
// Copied from `github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase`
//

type accountDecryptKeyUseCaseImpl struct {
	config   *config.Configuration
	logger   *slog.Logger
	keystore pkgkeystore.KeystoreAdapter
	repo     domain.AccountRepository
}

func NewAccountDecryptKeyUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	keystore pkgkeystore.KeystoreAdapter,
	repo domain.AccountRepository,
) AccountDecryptKeyUseCase {
	return &accountDecryptKeyUseCaseImpl{config, logger, keystore, repo}
}

func (uc *accountDecryptKeyUseCaseImpl) Execute(ctx context.Context, walletKeystoreBytes []byte, walletPassword *sstring.SecureString) (*keystore.Key, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if walletKeystoreBytes == nil {
		e["wallet_keystore_bytes"] = "missing value"
	}
	if walletPassword == nil {
		e["wallet_password"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed reading account key",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Decrypt key
	//

	key, err := uc.keystore.OpenWallet(walletKeystoreBytes, walletPassword)
	if err != nil {
		uc.logger.Warn("Failed getting account",
			slog.Any("error", err))
		return nil, httperror.NewForBadRequestWithSingleField("message", fmt.Sprintf("failed getting wallet: %v", err))
	}

	return key, nil
}
