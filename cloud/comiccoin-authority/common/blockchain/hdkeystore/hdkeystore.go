package hdkeystore

import (
	"fmt"

	"github.com/ethereum/go-ethereum/accounts"
	"github.com/ethereum/go-ethereum/common"
	hdwallet "github.com/miguelmota/go-ethereum-hdwallet"
	"github.com/tyler-smith/go-bip39"

	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/security/securestring"
)

type KeystoreAdapter interface {
	GenerateMnemonic() (string, error)
	OpenWallet(mnemonic *sstring.SecureString, path string) (accounts.Account, *hdwallet.Wallet, error)
	DeriveAddress(wallet *hdwallet.Wallet, path string) (common.Address, error)
	DeriveAccount(wallet *hdwallet.Wallet, path string) (accounts.Account, error)
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

func (impl *keystoreAdapterImpl) DeriveAddress(wallet *hdwallet.Wallet, path string) (common.Address, error) {
	derivationPath := hdwallet.MustParseDerivationPath(path)
	account, err := wallet.Derive(derivationPath, true)
	if err != nil {
		return common.Address{}, fmt.Errorf("failed to derive account: %v", err)
	}
	return account.Address, nil
}

func (impl *keystoreAdapterImpl) DeriveAccount(wallet *hdwallet.Wallet, path string) (accounts.Account, error) {
	derivationPath := hdwallet.MustParseDerivationPath(path)
	account, err := wallet.Derive(derivationPath, true)
	if err != nil {
		return accounts.Account{}, fmt.Errorf("failed to derive account: %v", err)
	}
	return account, nil
}
