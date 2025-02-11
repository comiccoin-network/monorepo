// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/config/config.go
package config

import (
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/ethereum/go-ethereum/common"

	sbytes "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/security/securebytes"
	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/security/securestring"
)

type Configuration struct {
	App        AppConfig
	OAuth      OAuthConfig
	AWS        AWSConfig
	Blockchain BlockchainConfig
	DB         DBConfig
	Emailer    MailgunConfig
}

type AppConfig struct {
	DataDirectory              string
	FrontendDomain             string
	BackendDomain              string
	Port                       string
	IP                         string
	HTTPAddress                string
	WalletAddress              *common.Address
	WalletMnemonic             *sstring.SecureString
	WalletPath                 string
	AuthorityHTTPAddress       string
	NFTStorageHTTPAddress      string
	HMACSecret                 *sbytes.SecureBytes
	RegistrationCoinsReward    uint64
	ComicSubmissionCoinsReward uint64
	GeoLiteDBPath              string
	BannedCountries            []string
}

type AWSConfig struct {
	AccessKey  string
	SecretKey  string
	Endpoint   string
	Region     string
	BucketName string
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
}

type DBConfig struct {
	URI  string
	Name string
}

type OAuthConfig struct {
	ServerURL         string
	ClientID          string
	ClientSecret      string
	ClientRedirectURI string
	ClientCancelURI   string
}

type MailgunConfig struct {
	APIKey           string
	Domain           string
	APIBase          string
	SenderEmail      string
	MaintenanceEmail string
}

func NewProviderUsingEnvironmentVariables() *Configuration {
	var c Configuration

	// Application section.
	c.App.DataDirectory = getEnv("COMICCOIN_PUBLICFAUCET_APP_DATA_DIRECTORY", true)
	c.App.FrontendDomain = getEnv("COMICCOIN_PUBLICFAUCET_APP_FRONTEND_DOMAIN", true)
	c.App.BackendDomain = getEnv("COMICCOIN_PUBLICFAUCET_APP_BACKEND_DOMAIN", true)
	c.App.Port = getEnv("COMICCOIN_PUBLICFAUCET_PORT", true)
	c.App.IP = getEnv("COMICCOIN_PUBLICFAUCET_IP", false)
	c.App.HTTPAddress = fmt.Sprintf("%v:%v", c.App.IP, c.App.Port)
	c.App.RegistrationCoinsReward = getUint64Env("COMICCOIN_PUBLICFAUCET_APP_REGISTRATION_COINS_REWARD", true)
	c.App.ComicSubmissionCoinsReward = getUint64Env("COMICCOIN_PUBLICFAUCET_APP_COMIC_SUBMISSION_COINS_REWARD", true)
	walletAddress := getEnv("COMICCOIN_PUBLICFAUCET_WALLET_ADDRESS", false)
	if walletAddress != "" {
		address := common.HexToAddress(walletAddress)
		c.App.WalletAddress = &address
	}
	c.App.WalletMnemonic = getSecureStringEnv("COMICCOIN_PUBLICFAUCET_WALLET_MNEMONIC", false)
	c.App.WalletPath = getEnv("COMICCOIN_PUBLICFAUCET_WALLET_PATH", true)
	c.App.AuthorityHTTPAddress = getEnv("COMICCOIN_PUBLICFAUCET_AUTHORITY_HTTP_ADDRESS", true)
	c.App.NFTStorageHTTPAddress = getEnv("COMICCOIN_PUBLICFAUCET_NFTSTORAGE_HTTP_ADDRESS", true)
	c.App.HMACSecret = getSecureBytesEnv("COMICCOIN_PUBLICFAUCET_HMAC_SECRET", true)
	c.App.GeoLiteDBPath = getEnv("COMICCOIN_PUBLICFAUCET_APP_GEOLITE_DB_PATH", false)
	c.App.BannedCountries = getStringsArrEnv("COMICCOIN_PUBLICFAUCET_APP_BANNED_COUNTRIES", false)

	// OAuth 2.0
	c.OAuth.ServerURL = getEnv("COMICCOIN_PUBLICFAUCET_OAUTH_SERVER_URL", true)
	c.OAuth.ClientID = getEnv("COMICCOIN_PUBLICFAUCET_OAUTH_CLIENT_ID", true)
	c.OAuth.ClientSecret = getEnv("COMICCOIN_PUBLICFAUCET_OAUTH_CLIENT_SECRET", true)
	c.OAuth.ClientRedirectURI = getEnv("COMICCOIN_PUBLICFAUCET_OAUTH_CLIENT_REDIRECT_URI", true)
	c.OAuth.ClientCancelURI = getEnv("COMICCOIN_PUBLICFAUCET_OAUTH_CLIENT_CANCEL_URI", true)

	// Amazon Web-Services Technology
	c.AWS.AccessKey = getEnv("COMICCOIN_PUBLICFAUCET_AWS_ACCESS_KEY", true)
	c.AWS.SecretKey = getEnv("COMICCOIN_PUBLICFAUCET_AWS_SECRET_KEY", true)
	c.AWS.Endpoint = getEnv("COMICCOIN_PUBLICFAUCET_AWS_ENDPOINT", true)
	c.AWS.Region = getEnv("COMICCOIN_PUBLICFAUCET_AWS_REGION", true)
	c.AWS.BucketName = getEnv("COMICCOIN_PUBLICFAUCET_AWS_BUCKET_NAME", true)

	// Blockchain section.
	chainID, _ := strconv.ParseUint(getEnv("COMICCOIN_PUBLICFAUCET_BLOCKCHAIN_CHAIN_ID", true), 10, 16)
	c.Blockchain.ChainID = uint16(chainID)
	transPerBlock, _ := strconv.ParseUint(getEnv("COMICCOIN_PUBLICFAUCET_BLOCKCHAIN_TRANS_PER_BLOCK", true), 10, 16)
	c.Blockchain.TransPerBlock = uint16(transPerBlock)
	difficulty, _ := strconv.ParseUint(getEnv("COMICCOIN_PUBLICFAUCET_BLOCKCHAIN_DIFFICULTY", true), 10, 16)
	c.Blockchain.Difficulty = uint16(difficulty)
	c.Blockchain.TransactionFee, _ = strconv.ParseUint(getEnv("COMICCOIN_PUBLICFAUCET_BLOCKCHAIN_TRANSACTION_FEE", false), 10, 64)

	// Database section.
	c.DB.URI = getEnv("COMICCOIN_PUBLICFAUCET_DB_URI", true)
	c.DB.Name = getEnv("COMICCOIN_PUBLICFAUCET_DB_NAME", true)

	// Mailgun section.
	c.Emailer.APIKey = getEnv("COMICCOIN_PUBLICFAUCET_MAILGUN_API_KEY", true)
	c.Emailer.Domain = getEnv("COMICCOIN_PUBLICFAUCET_MAILGUN_DOMAIN", true)
	c.Emailer.APIBase = getEnv("COMICCOIN_PUBLICFAUCET_MAILGUN_API_BASE", true)
	c.Emailer.SenderEmail = getEnv("COMICCOIN_PUBLICFAUCET_MAILGUN_SENDER_EMAIL", true)
	c.Emailer.MaintenanceEmail = getEnv("COMICCOIN_PUBLICFAUCET_MAILGUN_MAINTENANCE_EMAIL", true)

	return &c
}

func getEnv(key string, required bool) string {
	value := os.Getenv(key)
	if required && value == "" {
		log.Fatalf("Environment variable not found: %s", key)
	}
	return value
}

func getBytesEnv(key string, required bool) []byte {
	value := os.Getenv(key)
	if required && value == "" {
		log.Fatalf("Environment variable not found: %s", key)
	}
	return []byte(value)
}

func getSecureStringEnv(key string, required bool) *sstring.SecureString {
	value := os.Getenv(key)
	if required && value == "" {
		log.Fatalf("Environment variable not found: %s", key)
	}
	ss, err := sstring.NewSecureString(value)
	if err != nil {
		log.Fatalf("Environment variable `%v` failed to secure: %v", key, err)
	}
	return ss
}

func getSecureBytesEnv(key string, required bool) *sbytes.SecureBytes {
	value := getBytesEnv(key, required)
	sb, err := sbytes.NewSecureBytes(value)
	if err != nil {
		log.Fatalf("Environment variable `%v` failed to secure: %v", key, err)
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

func getUint64Env(key string, required bool) uint64 {
	value := os.Getenv(key)
	if value == "" && required {
		log.Fatalf("Environment variable not found: %s", key)
	}
	uintValue, err := strconv.ParseUint(value, 10, 64)
	if err != nil && (required || value != "") {
		log.Fatalf("Failed to parse environment variable as uint64: %s = %q, error: %v", key, value, err)
	}
	return uintValue
}

func getStringsArrEnv(key string, required bool) []string {
	value := os.Getenv(key)
	if required && value == "" {
		log.Fatalf("Environment variable not found: %s", key)
	}
	return strings.Split(value, ",")
}
