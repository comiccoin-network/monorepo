package wallet

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/ethereum/go-ethereum/accounts"
	hdwallet "github.com/miguelmota/go-ethereum-hdwallet"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/blockchain/hdkeystore"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/httperror"
	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/security/securestring"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/domain"
)

type WalletEncryptKeyUseCase interface {
	Execute(ctx context.Context, mnemonic *sstring.SecureString, path string) (*accounts.Account, *hdwallet.Wallet, error)
}

type walletEncryptKeyUseCaseImpl struct {
	config   *config.Configuration
	logger   *slog.Logger
	keystore hdkeystore.KeystoreAdapter
	repo     domain.WalletRepository
}

func NewWalletEncryptKeyUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	keystore hdkeystore.KeystoreAdapter,
	repo domain.WalletRepository,
) WalletEncryptKeyUseCase {
	return &walletEncryptKeyUseCaseImpl{config, logger, keystore, repo}
}

func (uc *walletEncryptKeyUseCaseImpl) Execute(ctx context.Context, mnemonic *sstring.SecureString, path string) (*accounts.Account, *hdwallet.Wallet, error) {
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
