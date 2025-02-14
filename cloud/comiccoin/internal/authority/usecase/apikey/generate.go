package apikey

import (
	"fmt"
	"log/slog"
	"time"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/jwt"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/password"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/securestring"
)

type GenerateAPIKeyUseCase interface {
	Execute(chainID uint16) (*NFTStoreAppCredentials, error)
}

type generateAPIKeyUseCaseImpl struct {
	logger   *slog.Logger
	password password.Provider
	jwt      jwt.Provider
}

func NewGenerateAPIKeyUseCase(logger *slog.Logger, passp password.Provider, jwtp jwt.Provider) GenerateAPIKeyUseCase {
	return &generateAPIKeyUseCaseImpl{logger, passp, jwtp}
}

type NFTStoreAppCredentials struct {
	SecretString string
	APIKey       string
}

func (uc *generateAPIKeyUseCaseImpl) Execute(chainID uint16) (*NFTStoreAppCredentials, error) {

	// Generate hash for the secret.
	randomSecretStr, err := uc.password.GenerateSecureRandomString(64)
	if err != nil {
		uc.logger.Error("Failed generating secure random string error",
			slog.Any("error", err))
		return nil, err
	}
	randomSecretSecure, err := securestring.NewSecureString(randomSecretStr)
	if err != nil {
		uc.logger.Error("failed to secure random secret string",
			slog.Any("randomSecretStr", randomSecretStr),
		)
		return nil, err
	}

	randomSecretHash, err := uc.password.GenerateHashFromPassword(randomSecretSecure)
	if err != nil {
		uc.logger.Error("Failed hashing error",
			slog.Any("error", err))
		return nil, err
	}

	// Generate our one-time API key and attach it to the response. What is
	// important here is that we share the plaintext secret to the user to
	// keep but we do not keep the plaintext value in our system, we only
	// keep the hash, so we keep the value safe.
	apiKeyPayload := fmt.Sprintf("%v@%v", chainID, randomSecretStr)
	atExpiry := 250 * 24 * time.Hour // Duration: 250 years.
	apiKey, _, err := uc.jwt.GenerateJWTToken(apiKeyPayload, atExpiry)
	if err != nil {
		uc.logger.Error("jwt generate pairs error",
			slog.Any("err", err))
		return nil, err
	}

	return &NFTStoreAppCredentials{
		SecretString: randomSecretHash,
		APIKey:       apiKey,
	}, nil

}
