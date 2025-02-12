package config

import (
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"

	sbytes "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/security/securebytes"
	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/security/securestring"
)

type Configuration struct {
	App     AppConfig
	AWS     AWSConfig
	DB      DBConfig
	Emailer MailgunConfig
}

type AppConfig struct {
	DataDirectory              string
	FrontendDomain             string
	BackendDomain              string
	Port                       string
	IP                         string
	HTTPAddress                string
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

type DBConfig struct {
	URI  string
	Name string
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
	c.App.DataDirectory = getEnv("COMICCOIN_GATEWAY_APP_DATA_DIRECTORY", true)
	c.App.FrontendDomain = getEnv("COMICCOIN_GATEWAY_APP_FRONTEND_DOMAIN", true)
	c.App.BackendDomain = getEnv("COMICCOIN_GATEWAY_APP_BACKEND_DOMAIN", true)
	c.App.Port = getEnv("COMICCOIN_GATEWAY_PORT", true)
	c.App.IP = getEnv("COMICCOIN_GATEWAY_IP", false)
	c.App.HTTPAddress = fmt.Sprintf("%v:%v", c.App.IP, c.App.Port)
	c.App.AuthorityHTTPAddress = getEnv("COMICCOIN_GATEWAY_AUTHORITY_HTTP_ADDRESS", true)
	c.App.NFTStorageHTTPAddress = getEnv("COMICCOIN_GATEWAY_NFTSTORAGE_HTTP_ADDRESS", true)
	c.App.HMACSecret = getSecureBytesEnv("COMICCOIN_GATEWAY_HMAC_SECRET", true)
	c.App.GeoLiteDBPath = getEnv("COMICCOIN_GATEWAY_APP_GEOLITE_DB_PATH", false)
	c.App.BannedCountries = getStringsArrEnv("COMICCOIN_GATEWAY_APP_BANNED_COUNTRIES", false)

	// Amazon Web-Services Technology
	c.AWS.AccessKey = getEnv("COMICCOIN_GATEWAY_AWS_ACCESS_KEY", true)
	c.AWS.SecretKey = getEnv("COMICCOIN_GATEWAY_AWS_SECRET_KEY", true)
	c.AWS.Endpoint = getEnv("COMICCOIN_GATEWAY_AWS_ENDPOINT", true)
	c.AWS.Region = getEnv("COMICCOIN_GATEWAY_AWS_REGION", true)
	c.AWS.BucketName = getEnv("COMICCOIN_GATEWAY_AWS_BUCKET_NAME", true)

	// Database section.
	c.DB.URI = getEnv("COMICCOIN_GATEWAY_DB_URI", true)
	c.DB.Name = getEnv("COMICCOIN_GATEWAY_DB_NAME", true)

	// Mailgun section.
	c.Emailer.APIKey = getEnv("COMICCOIN_GATEWAY_MAILGUN_API_KEY", true)
	c.Emailer.Domain = getEnv("COMICCOIN_GATEWAY_MAILGUN_DOMAIN", true)
	c.Emailer.APIBase = getEnv("COMICCOIN_GATEWAY_MAILGUN_API_BASE", true)
	c.Emailer.SenderEmail = getEnv("COMICCOIN_GATEWAY_MAILGUN_SENDER_EMAIL", true)
	c.Emailer.MaintenanceEmail = getEnv("COMICCOIN_GATEWAY_MAILGUN_MAINTENANCE_EMAIL", true)

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
