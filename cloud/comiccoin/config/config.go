package config

import (
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/ethereum/go-ethereum/common"

	sbytes "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/securebytes"
	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/securestring"
)

type Configuration struct {
	App                 AppConfig
	Blockchain          BlockchainConfig
	Cache               CacheConf
	DB                  DBConfig
	NFTStore            NFTStorageConfig
	PublicFaucetEmailer PublicFaucetMailgunConfig
}

type CacheConf struct {
	URI string
}

type AppConfig struct {
	DataDirectory            string
	Port                     string
	IP                       string
	AdministrationHMACSecret *sbytes.SecureBytes
	AdministrationSecretKey  *sstring.SecureString
	GeoLiteDBPath            string
	BannedCountries          []string
}

// BlockchainConfig represents the configuration for the blockchain.
// It contains settings for the chain ID, transactions per block, difficulty, mining reward, gas price, and units of gas.
type BlockchainConfig struct {
	// ChainID is the unique ID for this blockchain instance.
	ChainID uint16 `json:"chain_id"`

	// TransPerBlock is the maximum number of transactions that can be included in a block.
	TransPerBlock uint16 `json:"trans_per_block"`

	// Difficulty represents how difficult it should be to solve the work problem.
	Difficulty uint16 `json:"difficulty"`

	// ComicCoin: Fee that must be paid for every transaction. This value is provided by the authority.
	TransactionFee uint64 `bson:"transaction_fee" json:"transaction_fee"`

	// (Only set by PoA node)
	ProofOfAuthorityAccountAddress *common.Address
	ProofOfAuthorityWalletMnemonic *sstring.SecureString
	ProofOfAuthorityWalletPath     string

	// The location of the authority address.
	AuthorityServerURL string

	// (Only set by Public Faucet node)
	PublicFaucetAccountAddress   *common.Address
	PublicFaucetWalletMnemonic   *sstring.SecureString
	PublicFaucetWalletPath       string
	PublicFaucetClaimCoinsReward uint64
}

type DBConfig struct {
	URI              string
	AuthorityName    string
	GatewayName      string
	PublicFaucetName string
}

type NFTStorageConfig struct {
	URI string
}

type PublicFaucetMailgunConfig struct {
	APIKey           string
	Domain           string
	APIBase          string
	SenderEmail      string
	MaintenanceEmail string
	FrontendDomain   string
	BackendDomain    string
}

func NewProvider() *Configuration {
	var c Configuration

	// --- Application section ---
	c.App.DataDirectory = getEnv("COMICCOIN_APP_DATA_DIRECTORY", true)
	c.App.Port = getEnv("COMICCOIN_PORT", true)
	c.App.IP = getEnv("COMICCOIN_IP", false)
	c.App.AdministrationHMACSecret = getSecureBytesEnv("COMICCOIN_APP_ADMINISTRATION_HMAC_SECRET", false)
	c.App.AdministrationSecretKey = getSecureStringEnv("COMICCOIN_APP_ADMINISTRATION_SECRET_KEY", false)
	c.App.GeoLiteDBPath = getEnv("COMICCOIN_APP_GEOLITE_DB_PATH", false)
	c.App.BannedCountries = getStringsArrEnv("COMICCOIN_APP_BANNED_COUNTRIES", false)

	// --- Blockchain section ---
	// Authority only.
	chainID, _ := strconv.ParseUint(getEnv("COMICCOIN_BLOCKCHAIN_CHAIN_ID", true), 10, 16)
	c.Blockchain.ChainID = uint16(chainID)
	transPerBlock, _ := strconv.ParseUint(getEnv("COMICCOIN_BLOCKCHAIN_TRANS_PER_BLOCK", true), 10, 16)
	c.Blockchain.TransPerBlock = uint16(transPerBlock)
	difficulty, _ := strconv.ParseUint(getEnv("COMICCOIN_BLOCKCHAIN_DIFFICULTY", true), 10, 16)
	c.Blockchain.Difficulty = uint16(difficulty)
	c.Blockchain.TransactionFee, _ = strconv.ParseUint(getEnv("COMICCOIN_BLOCKCHAIN_TRANSACTION_FEE", true), 10, 64)
	proofOfAuthorityAccountAddress := getEnv("COMICCOIN_BLOCKCHAIN_PROOF_OF_AUTHORITY_ACCOUNT_ADDRESS", false)
	if proofOfAuthorityAccountAddress != "" {
		address := common.HexToAddress(proofOfAuthorityAccountAddress)
		c.Blockchain.ProofOfAuthorityAccountAddress = &address
	}
	c.Blockchain.ProofOfAuthorityWalletMnemonic = getSecureStringEnv("COMICCOIN_BLOCKCHAIN_PROOF_OF_AUTHORITY_WALLET_MNEMONIC", false)
	c.Blockchain.ProofOfAuthorityWalletPath = getEnv("COMICCOIN_BLOCKCHAIN_PROOF_OF_AUTHORITY_WALLET_PATH", false)
	c.Blockchain.AuthorityServerURL = getEnv("COMICCOIN_BLOCKCHAIN_AUTHORITY_SERVER_URL", true)

	// Public Faucet only.
	publicFaucetAccountAddress := getEnv("COMICCOIN_BLOCKCHAIN_PUBLICFAUCET_ACCOUNT_ADDRESS", false)
	if publicFaucetAccountAddress != "" {
		address := common.HexToAddress(publicFaucetAccountAddress)
		c.Blockchain.PublicFaucetAccountAddress = &address
	}
	c.Blockchain.PublicFaucetWalletMnemonic = getSecureStringEnv("COMICCOIN_BLOCKCHAIN_PUBLICFAUCET_WALLET_MNEMONIC", false)
	c.Blockchain.PublicFaucetWalletPath = getEnv("COMICCOIN_BLOCKCHAIN_PUBLICFAUCET_WALLET_PATH", false)

	// --- Database section ---
	c.DB.URI = getEnv("COMICCOIN_DB_URI", true)
	c.DB.AuthorityName = getEnv("COMICCOIN_DB_AUTHORITY_NAME", true)
	c.DB.GatewayName = getEnv("COMICCOIN_DB_GATEWAY_NAME", true)
	c.DB.PublicFaucetName = getEnv("COMICCOIN_DB_PUBLICFAUCET_NAME", true)

	// --- Cache ---
	c.Cache.URI = getEnv("COMICCOIN_CACHE_URI", true)

	// --- NFT Storage ---
	c.NFTStore.URI = getEnv("COMICCOIN_NFT_STORAGE_URI", true)

	// --- Public Faucet ---
	// Mailgun section.
	c.PublicFaucetEmailer.APIKey = getEnv("COMICCOIN_PUBLICFAUCET_MAILGUN_API_KEY", true)
	c.PublicFaucetEmailer.Domain = getEnv("COMICCOIN_PUBLICFAUCET_MAILGUN_DOMAIN", true)
	c.PublicFaucetEmailer.APIBase = getEnv("COMICCOIN_PUBLICFAUCET_MAILGUN_API_BASE", true)
	c.PublicFaucetEmailer.SenderEmail = getEnv("COMICCOIN_PUBLICFAUCET_MAILGUN_SENDER_EMAIL", true)
	c.PublicFaucetEmailer.MaintenanceEmail = getEnv("COMICCOIN_PUBLICFAUCET_MAILGUN_MAINTENANCE_EMAIL", true)
	c.PublicFaucetEmailer.FrontendDomain = getEnv("COMICCOIN_PUBLICFAUCET_MAILGUN_FRONTEND_DOMAIN", true)
	c.PublicFaucetEmailer.BackendDomain = getEnv("COMICCOIN_PUBLICFAUCET_MAILGUN_BACKEND_DOMAIN", true)

	// Claim Coins Reward
	c.Blockchain.PublicFaucetClaimCoinsReward = getUint64Env("COMICCOIN_PUBLICFAUCET_CLAIM_COINS_REWARD", true)

	return &c
}

func getEnv(key string, required bool) string {
	value := os.Getenv(key)
	if required && value == "" {
		log.Fatalf("Environment variable not found: %s", key)
	}
	return value
}

func getSecureStringEnv(key string, required bool) *sstring.SecureString {
	value := os.Getenv(key)
	if required && value == "" {
		log.Fatalf("Environment variable not found: %s", key)
	}
	ss, err := sstring.NewSecureString(value)
	if ss == nil && required == false {
		return nil
	}
	if err != nil {
		log.Fatalf("Environment variable failed to secure: %v", err)
	}
	return ss
}

func getBytesEnv(key string, required bool) []byte {
	value := os.Getenv(key)
	if required && value == "" {
		log.Fatalf("Environment variable not found: %s", key)
	}
	return []byte(value)
}

func getSecureBytesEnv(key string, required bool) *sbytes.SecureBytes {
	value := getBytesEnv(key, required)
	sb, err := sbytes.NewSecureBytes(value)
	if sb == nil && required == false {
		return nil
	}
	if err != nil {
		log.Fatalf("Environment variable failed to secure: %v", err)
	}
	return sb
}

func getEnvBool(key string, required bool, defaultValue bool) bool {
	valueStr := getEnv(key, required)
	if valueStr == "" {
		return defaultValue
	}
	value, err := strconv.ParseBool(valueStr)
	if err != nil {
		log.Fatalf("Invalid boolean value for environment variable %s", key)
	}
	return value
}

func getStringsArrEnv(key string, required bool) []string {
	value := os.Getenv(key)
	if required && value == "" {
		log.Fatalf("Environment variable not found: %s", key)
	}
	return strings.Split(value, ",")
}

func getUint64Env(key string, required bool) uint64 {
	value := os.Getenv(key)
	if required && value == "" {
		log.Fatalf("Environment variable not found: %s", key)
	}
	valueUint64, err := strconv.ParseUint(value, 10, 64)
	if err != nil {
		log.Fatalf("Invalid uint64 value for environment variable %s", key)
	}
	return valueUint64
}
