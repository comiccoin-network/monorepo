package hdkeystore

import (
	"strings"
	"testing"

	"github.com/ethereum/go-ethereum/accounts"
	hdwallet "github.com/miguelmota/go-ethereum-hdwallet"
	"github.com/stretchr/testify/assert"
	"github.com/tyler-smith/go-bip39"

	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/security/securestring"
)

func TestGenerateMnemonic(t *testing.T) {
	adapter := NewAdapter()

	t.Run("successful mnemonic generation", func(t *testing.T) {
		mnemonic, err := adapter.GenerateMnemonic()
		assert.NoError(t, err)
		assert.NotEmpty(t, mnemonic)

		// Verify mnemonic is valid
		words := strings.Split(mnemonic, " ")
		assert.Equal(t, 24, len(words)) // 256-bit entropy produces 24 words

		// Verify mnemonic is valid according to BIP39
		assert.True(t, bip39.IsMnemonicValid(mnemonic))
	})
}

func TestOpenWallet(t *testing.T) {
	adapter := NewAdapter()
	validPath := "m/44'/60'/0'/0/0" // Standard Ethereum path

	t.Run("successful wallet opening", func(t *testing.T) {
		// Generate a valid mnemonic first
		mnemonic, err := adapter.GenerateMnemonic()
		assert.NoError(t, err)

		secureMnemonic, err := sstring.NewSecureString(mnemonic)
		assert.NoError(t, err)

		account, wallet, err := adapter.OpenWallet(secureMnemonic, validPath)
		assert.NoError(t, err)
		assert.NotNil(t, wallet)
		assert.NotEmpty(t, account.Address.Hex())

		// Verify the account can be derived again with the same path
		path := hdwallet.MustParseDerivationPath(validPath)
		derivedAccount, err := wallet.Derive(path, false)
		assert.NoError(t, err)
		assert.Equal(t, account.Address, derivedAccount.Address)
	})

	t.Run("invalid mnemonic", func(t *testing.T) {
		invalidMnemonic, err := sstring.NewSecureString("invalid mnemonic phrase")
		assert.NoError(t, err)

		account, wallet, err := adapter.OpenWallet(invalidMnemonic, validPath)
		assert.Error(t, err)
		assert.Equal(t, accounts.Account{}, account)
		assert.Nil(t, wallet)
	})

	t.Run("invalid derivation path", func(t *testing.T) {
		_, err := hdwallet.ParseDerivationPath("m/invalid/path")
		assert.Error(t, err, "ParseDerivationPath should error on invalid path")
	})
}

func TestOpenWalletWithPassphrase(t *testing.T) {
	adapter := NewAdapter()
	validPath := "m/44'/60'/0'/0/0"
	passphrase := "test passphrase"

	t.Run("successful wallet opening with passphrase", func(t *testing.T) {
		mnemonic, err := adapter.GenerateMnemonic()
		assert.NoError(t, err)

		secureMnemonic, err := sstring.NewSecureString(mnemonic)
		assert.NoError(t, err)

		securePassphrase, err := sstring.NewSecureString(passphrase)
		assert.NoError(t, err)

		account, wallet, err := adapter.OpenWalletWithPassphrase(secureMnemonic, securePassphrase, validPath)
		assert.NoError(t, err)
		assert.NotNil(t, wallet)
		assert.NotEmpty(t, account.Address.Hex())

		// Verify the account can be derived again with the same path
		path := hdwallet.MustParseDerivationPath(validPath)
		derivedAccount, err := wallet.Derive(path, false)
		assert.NoError(t, err)
		assert.Equal(t, account.Address, derivedAccount.Address)
	})

	t.Run("invalid mnemonic with passphrase", func(t *testing.T) {
		invalidMnemonic, err := sstring.NewSecureString("invalid mnemonic phrase")
		assert.NoError(t, err)

		securePassphrase, err := sstring.NewSecureString(passphrase)
		assert.NoError(t, err)

		account, wallet, err := adapter.OpenWalletWithPassphrase(invalidMnemonic, securePassphrase, validPath)
		assert.Error(t, err)
		assert.Equal(t, accounts.Account{}, account)
		assert.Nil(t, wallet)
	})

	t.Run("invalid derivation path with passphrase", func(t *testing.T) {
		_, err := hdwallet.ParseDerivationPath("m/invalid/path")
		assert.Error(t, err, "ParseDerivationPath should error on invalid path")
	})

	t.Run("same mnemonic different passphrase produces different addresses", func(t *testing.T) {
		mnemonic, err := adapter.GenerateMnemonic()
		assert.NoError(t, err)

		secureMnemonic, err := sstring.NewSecureString(mnemonic)
		assert.NoError(t, err)

		passphrase1, err := sstring.NewSecureString("passphrase1")
		assert.NoError(t, err)

		passphrase2, err := sstring.NewSecureString("passphrase2")
		assert.NoError(t, err)

		account1, _, err := adapter.OpenWalletWithPassphrase(secureMnemonic, passphrase1, validPath)
		assert.NoError(t, err)

		account2, _, err := adapter.OpenWalletWithPassphrase(secureMnemonic, passphrase2, validPath)
		assert.NoError(t, err)

		assert.NotEqual(t, account1.Address, account2.Address)
	})
}
