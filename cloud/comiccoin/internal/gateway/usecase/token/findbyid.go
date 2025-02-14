// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/usecase/token/findbyid.go
package token

import (
	"context"
	"errors"
	"log/slog"
	"time"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	dom_token "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/domain/token"
)

type TokenFindByIDUseCase interface {
	Execute(ctx context.Context, tokenID string) (*dom_token.Token, error)
}

type tokenFindByIDUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_token.Repository
}

func NewTokenFindByIDUseCase(config *config.Configuration, logger *slog.Logger, repo dom_token.Repository) TokenFindByIDUseCase {
	return &tokenFindByIDUseCaseImpl{config, logger, repo}
}

func (uc *tokenFindByIDUseCaseImpl) Execute(ctx context.Context, tokenID string) (*dom_token.Token, error) {
	// STEP 1: Validation
	e := make(map[string]string)
	if tokenID == "" {
		e["token_id"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("validation failed for token lookup",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	// STEP 2: Retrieve from database
	token, err := uc.repo.FindByTokenID(ctx, tokenID)
	if err != nil {
		// Check for specific errors
		if errors.Is(err, dom_token.ErrTokenNotFound) {
			uc.logger.Warn("token not found",
				slog.String("token_id", tokenID))
			return nil, err // Pass through the domain error
		}
		return nil, err
	}

	// STEP 3: Validate token state
	if token != nil {
		if token.IsRevoked {
			uc.logger.Warn("attempt to use revoked token",
				slog.String("token_id", tokenID))
			return nil, dom_token.ErrTokenRevoked
		}
		if token.ExpiresAt.Before(time.Now()) {
			uc.logger.Warn("attempt to use expired token",
				slog.String("token_id", tokenID))
			return nil, dom_token.ErrTokenExpired
		}
	}

	return token, nil
}
