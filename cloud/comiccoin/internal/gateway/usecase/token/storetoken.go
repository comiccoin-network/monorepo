// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/usecase/token/storetoken.go
package token

import (
	"context"
	"log/slog"
	"time"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	dom_token "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/domain/token"
)

type TokenStoreUseCase interface {
	Execute(ctx context.Context, token *dom_token.Token) error
}

type tokenStoreUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_token.Repository
}

func NewTokenStoreUseCase(config *config.Configuration, logger *slog.Logger, repo dom_token.Repository) TokenStoreUseCase {
	return &tokenStoreUseCaseImpl{config, logger, repo}
}

func (uc *tokenStoreUseCaseImpl) Execute(ctx context.Context, token *dom_token.Token) error {
	// STEP 1: Validation
	e := make(map[string]string)
	if token == nil {
		e["token"] = "missing value"
	} else {
		if token.TokenID == "" {
			e["token_id"] = "missing value"
		}
		if token.TokenType == "" {
			e["token_type"] = "missing value"
		} else if token.TokenType != "access" && token.TokenType != "refresh" {
			e["token_type"] = "must be either 'access' or 'refresh'"
		}
		if token.FederatedIdentityID == "" {
			e["federatedidentity_id"] = "missing value"
		}
		if token.AppID == "" {
			e["app_id"] = "missing value"
		}
		if token.Scope == "" {
			e["scope"] = "missing value"
		}
	}
	if len(e) != 0 {
		uc.logger.Warn("validation failed for token creation",
			slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	// STEP 2: Set timestamps and defaults
	now := time.Now()
	token.IssuedAt = now
	token.LastUsedAt = now
	token.IsRevoked = false

	// Set expiration based on token type
	switch token.TokenType {
	case "access":
		token.ExpiresAt = now.Add(5 * time.Minute) // Access tokens expire in 5 minutes
	case "refresh":
		token.ExpiresAt = now.Add(30 * 24 * time.Hour) // Refresh tokens expire in 30 days
	}

	// STEP 3: Store in database
	if err := uc.repo.StoreToken(ctx, token); err != nil {
		uc.logger.Error("failed to store token",
			slog.String("token_type", token.TokenType),
			slog.String("app_id", token.AppID),
			slog.String("federatedidentity_id", token.FederatedIdentityID),
			slog.Any("error", err))
		return err
	}

	return nil
}
