package hdkeystore

import (
	"strings"
	"testing"

	"github.com/ethereum/go-ethereum/accounts"
	hdwallet "github.com/miguelmota/go-ethereum-hdwallet"
	"github.com/stretchr/testify/assert"
	"github.com/tyler-smith/go-bip39"

	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/security/securestring"
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

func TestEncryptDecryptWallet(t *testing.T) {
	adapter := NewAdapter()
	validPath := "m/44'/60'/0'/0/0"
	password := "testPassword123"

	t.Run("successful encrypt and decrypt", func(t *testing.T) {
		mnemonic, err := adapter.GenerateMnemonic()
		assert.NoError(t, err)
		secureMnemonic, err := sstring.NewSecureString(mnemonic)
		assert.NoError(t, err)
		securePassword, err := sstring.NewSecureString(password)
		assert.NoError(t, err)

		originalAccount, _, err := adapter.OpenWallet(secureMnemonic, validPath)
		assert.NoError(t, err)

		encryptedData, err := adapter.EncryptWallet(secureMnemonic, validPath, securePassword)
		assert.NoError(t, err)
		assert.NotEmpty(t, encryptedData)

		decryptedAccount, decryptedWallet, err := adapter.DecryptWallet(encryptedData, securePassword)
		assert.NoError(t, err)
		assert.NotNil(t, decryptedWallet)

		assert.Equal(t, originalAccount.Address, decryptedAccount.Address)
	})

	t.Run("decrypt with wrong password", func(t *testing.T) {
		mnemonic, err := adapter.GenerateMnemonic()
		assert.NoError(t, err)
		secureMnemonic, err := sstring.NewSecureString(mnemonic)
		assert.NoError(t, err)
		securePassword, err := sstring.NewSecureString(password)
		assert.NoError(t, err)

		encryptedData, err := adapter.EncryptWallet(secureMnemonic, validPath, securePassword)
		assert.NoError(t, err)

		wrongPassword, err := sstring.NewSecureString("wrongpassword")
		assert.NoError(t, err)
		_, _, err = adapter.DecryptWallet(encryptedData, wrongPassword)
		assert.Error(t, err)
	})

	t.Run("decrypt corrupted data", func(t *testing.T) {
		securePassword, err := sstring.NewSecureString(password)
		assert.NoError(t, err)
		_, _, err = adapter.DecryptWallet([]byte("corrupted data"), securePassword)
		assert.Error(t, err)
	})
}

func TestDecryptMnemonicPhrase(t *testing.T) {
	adapter := NewAdapter()
	validPath := "m/44'/60'/0'/0/0"
	password := "testPassword123"

	t.Run("successful decrypt mnemonic", func(t *testing.T) {
		// Generate original mnemonic and encrypt it
		originalMnemonic, err := adapter.GenerateMnemonic()
		assert.NoError(t, err)
		secureMnemonic, err := sstring.NewSecureString(originalMnemonic)
		assert.NoError(t, err)
		securePassword, err := sstring.NewSecureString(password)
		assert.NoError(t, err)

		// Encrypt the wallet data
		encryptedData, err := adapter.EncryptWallet(secureMnemonic, validPath, securePassword)
		assert.NoError(t, err)
		assert.NotEmpty(t, encryptedData)

		// Decrypt and verify mnemonic and path
		decryptedMnemonic, decryptedPath, err := adapter.DecryptMnemonicPhrase(encryptedData, securePassword)
		assert.NoError(t, err)
		assert.NotNil(t, decryptedMnemonic)
		assert.Equal(t, originalMnemonic, decryptedMnemonic.String())
		assert.Equal(t, validPath, decryptedPath)
	})

	t.Run("decrypt with wrong password", func(t *testing.T) {
		originalMnemonic, err := adapter.GenerateMnemonic()
		assert.NoError(t, err)
		secureMnemonic, err := sstring.NewSecureString(originalMnemonic)
		assert.NoError(t, err)
		securePassword, err := sstring.NewSecureString(password)
		assert.NoError(t, err)

		encryptedData, err := adapter.EncryptWallet(secureMnemonic, validPath, securePassword)
		assert.NoError(t, err)

		wrongPassword, err := sstring.NewSecureString("wrongpassword")
		assert.NoError(t, err)
		decryptedMnemonic, decryptedPath, err := adapter.DecryptMnemonicPhrase(encryptedData, wrongPassword)
		assert.Error(t, err)
		assert.Nil(t, decryptedMnemonic)
		assert.Empty(t, decryptedPath)
	})

	t.Run("decrypt corrupted data", func(t *testing.T) {
		securePassword, err := sstring.NewSecureString(password)
		assert.NoError(t, err)
		decryptedMnemonic, decryptedPath, err := adapter.DecryptMnemonicPhrase([]byte("corrupted data"), securePassword)
		assert.Error(t, err)
		assert.Nil(t, decryptedMnemonic)
		assert.Empty(t, decryptedPath)
	})
}
