package hdkeystore

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/ecdsa"
	"crypto/rand"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"io"

	"github.com/ethereum/go-ethereum/accounts"
	"github.com/ethereum/go-ethereum/crypto"
	hdwallet "github.com/miguelmota/go-ethereum-hdwallet"
	"github.com/tyler-smith/go-bip39"
	"golang.org/x/crypto/pbkdf2"

	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/security/securestring"
)

type KeystoreAdapter interface {
	GenerateMnemonic() (string, error)
	OpenWallet(mnemonic *sstring.SecureString, path string) (accounts.Account, *hdwallet.Wallet, error)
	OpenWalletWithPassphrase(mnemonic *sstring.SecureString, passphrase *sstring.SecureString, path string) (accounts.Account, *hdwallet.Wallet, error)
	EncryptWallet(mnemonic *sstring.SecureString, path string, password *sstring.SecureString) ([]byte, error)
	DecryptWallet(cryptData []byte, password *sstring.SecureString) (accounts.Account, *hdwallet.Wallet, error)
	DecryptMnemonicPhrase(cryptData []byte, password *sstring.SecureString) (*sstring.SecureString, string, error)
	PrivateKeyFromOpenWallet(mnemonic *sstring.SecureString, path string) (*ecdsa.PrivateKey, error)
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

type encryptedWallet struct {
	Salt          []byte `json:"salt"`
	EncryptedData []byte `json:"encrypted_data"`
	Nonce         []byte `json:"nonce"`
}

type walletData struct {
	Mnemonic string `json:"mnemonic"`
	Path     string `json:"path"`
}

const (
	keySize    = 32
	saltSize   = 32
	iterations = 100000
)

func (impl *keystoreAdapterImpl) EncryptWallet(mnemonic *sstring.SecureString, path string, password *sstring.SecureString) ([]byte, error) {
	salt := make([]byte, saltSize)
	if _, err := io.ReadFull(rand.Reader, salt); err != nil {
		return nil, fmt.Errorf("failed to generate salt: %v", err)
	}

	key := pbkdf2.Key([]byte(password.String()), salt, iterations, keySize, sha256.New)

	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, fmt.Errorf("failed to create cipher: %v", err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, fmt.Errorf("failed to create GCM: %v", err)
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, fmt.Errorf("failed to generate nonce: %v", err)
	}

	data := walletData{
		Mnemonic: mnemonic.String(),
		Path:     path,
	}

	plaintext, err := json.Marshal(data)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal wallet data: %v", err)
	}

	ciphertext := gcm.Seal(nil, nonce, plaintext, nil)

	encWallet := encryptedWallet{
		Salt:          salt,
		EncryptedData: ciphertext,
		Nonce:         nonce,
	}

	return json.Marshal(encWallet)
}

func (impl *keystoreAdapterImpl) DecryptWallet(cryptData []byte, password *sstring.SecureString) (accounts.Account, *hdwallet.Wallet, error) {
	var encWallet encryptedWallet
	if err := json.Unmarshal(cryptData, &encWallet); err != nil {
		return accounts.Account{}, nil, fmt.Errorf("failed to unmarshal encrypted wallet: %v", err)
	}

	key := pbkdf2.Key([]byte(password.String()), encWallet.Salt, iterations, keySize, sha256.New)

	block, err := aes.NewCipher(key)
	if err != nil {
		return accounts.Account{}, nil, fmt.Errorf("failed to create cipher: %v", err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return accounts.Account{}, nil, fmt.Errorf("failed to create GCM: %v", err)
	}

	plaintext, err := gcm.Open(nil, encWallet.Nonce, encWallet.EncryptedData, nil)
	if err != nil {
		return accounts.Account{}, nil, fmt.Errorf("failed to decrypt wallet: %v", err)
	}

	var walletData walletData
	if err := json.Unmarshal(plaintext, &walletData); err != nil {
		return accounts.Account{}, nil, fmt.Errorf("failed to unmarshal wallet data: %v", err)
	}

	secureMnemonic, err := sstring.NewSecureString(walletData.Mnemonic)
	if err != nil {
		return accounts.Account{}, nil, fmt.Errorf("failed to secure mnemonic: %v", err)
	}
	return impl.OpenWallet(secureMnemonic, walletData.Path)
}

func (impl *keystoreAdapterImpl) DecryptMnemonicPhrase(cryptData []byte, password *sstring.SecureString) (*sstring.SecureString, string, error) {
	var encWallet encryptedWallet
	if err := json.Unmarshal(cryptData, &encWallet); err != nil {
		return nil, "", fmt.Errorf("failed to unmarshal encrypted wallet: %v", err)
	}

	key := pbkdf2.Key([]byte(password.String()), encWallet.Salt, iterations, keySize, sha256.New)

	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, "", fmt.Errorf("failed to create cipher: %v", err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, "", fmt.Errorf("failed to create GCM: %v", err)
	}

	plaintext, err := gcm.Open(nil, encWallet.Nonce, encWallet.EncryptedData, nil)
	if err != nil {
		return nil, "", fmt.Errorf("failed to decrypt wallet: %v", err)
	}

	var walletData walletData
	if err := json.Unmarshal(plaintext, &walletData); err != nil {
		return nil, "", fmt.Errorf("failed to unmarshal wallet data: %v", err)
	}

	secureMnemonic, err := sstring.NewSecureString(walletData.Mnemonic)
	if err != nil {
		return nil, "", fmt.Errorf("failed to secure mnemonic: %v", err)
	}

	return secureMnemonic, walletData.Path, nil
}

func (impl *keystoreAdapterImpl) PrivateKeyFromOpenWallet(mnemonic *sstring.SecureString, path string) (*ecdsa.PrivateKey, error) {
	wallet, err := hdwallet.NewFromMnemonic(mnemonic.String())
	if err != nil {
		return nil, fmt.Errorf("failed to open wallet: %v", err)
	}

	derivationPath := hdwallet.MustParseDerivationPath(path)
	ethAccount, err := wallet.Derive(derivationPath, true)
	if err != nil {
		return nil, fmt.Errorf("failed to derive account: %v", err)
	}

	privateKey, err := wallet.PrivateKey(ethAccount)
	if err != nil {
		return nil, fmt.Errorf("failed getting wallet private key: %s", err)
	}

	// Convert the private key to the correct curve format
	privateKeyBytes := crypto.FromECDSA(privateKey)
	correctedPrivateKey, err := crypto.ToECDSA(privateKeyBytes)
	if err != nil {
		return nil, fmt.Errorf("failed converting private key to correct curve: %s", err)
	}

	return correctedPrivateKey, nil
}
