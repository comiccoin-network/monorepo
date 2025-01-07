package hdkeystore

import (
	"fmt"

	"github.com/ethereum/go-ethereum/accounts"
	hdwallet "github.com/miguelmota/go-ethereum-hdwallet"
	"github.com/tyler-smith/go-bip39"

	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/security/securestring"
)

type KeystoreAdapter interface {
	GenerateMnemonic() (string, error)
	OpenWallet(mnemonic *sstring.SecureString, path string) (accounts.Account, *hdwallet.Wallet, error)
	OpenWalletWithPassphrase(mnemonic *sstring.SecureString, passphrase *sstring.SecureString, path string) (accounts.Account, *hdwallet.Wallet, error)
}

type keystoreAdapterImpl struct{}

func NewAdapter() KeystoreAdapter {
	return &keystoreAdapterImpl{}
}

func (impl *keystoreAdapterImpl) GenerateMnemonic() (string, error) {
	entropy, err := bip39.NewEntropy(256) // 24 words
	if err != nil {
		return "", fmt.Errorf("failed to generate entropy: %v", err)
	}

	mnemonic, err := bip39.NewMnemonic(entropy)
	if err != nil {
		return "", fmt.Errorf("failed to generate mnemonic: %v", err)
	}

	return mnemonic, nil
}

func (impl *keystoreAdapterImpl) OpenWallet(mnemonic *sstring.SecureString, path string) (accounts.Account, *hdwallet.Wallet, error) {
	wallet, err := hdwallet.NewFromMnemonic(mnemonic.String())
	if err != nil {
		return accounts.Account{}, nil, fmt.Errorf("failed to open wallet: %v", err)
	}

	derivationPath := hdwallet.MustParseDerivationPath(path)
	account, err := wallet.Derive(derivationPath, true)
	if err != nil {
		return accounts.Account{}, nil, fmt.Errorf("failed to derive account: %v", err)
	}

	return account, wallet, nil
}

func (impl *keystoreAdapterImpl) OpenWalletWithPassphrase(mnemonic *sstring.SecureString, passphrase *sstring.SecureString, path string) (accounts.Account, *hdwallet.Wallet, error) {
	wallet, err := hdwallet.NewFromMnemonic(mnemonic.String(), passphrase.String())
	if err != nil {
		return accounts.Account{}, nil, fmt.Errorf("failed to open wallet with passphrase: %v", err)
	}

	derivationPath := hdwallet.MustParseDerivationPath(path)
	account, err := wallet.Derive(derivationPath, true)
	if err != nil {
		return accounts.Account{}, nil, fmt.Errorf("failed to derive account: %v", err)
	}

	return account, wallet, nil
}
