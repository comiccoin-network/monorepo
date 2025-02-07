// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/usecase/token/revoke.go
package token

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/config"
	dom_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/domain/token"
)

type TokenRevokeUseCase interface {
	Execute(ctx context.Context, tokenID string) error
}

type tokenRevokeUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_token.Repository
}

func NewTokenRevokeUseCase(config *config.Configuration, logger *slog.Logger, repo dom_token.Repository) TokenRevokeUseCase {
	return &tokenRevokeUseCaseImpl{config, logger, repo}
}

func (uc *tokenRevokeUseCaseImpl) Execute(ctx context.Context, tokenID string) error {
	// STEP 1: Validation
	e := make(map[string]string)
	if tokenID == "" {
		e["token_id"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("validation failed for token revocation",
			slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	// STEP 2: Verify token exists
	token, err := uc.repo.FindByTokenID(ctx, tokenID)
	if err != nil {
		return err
	}
	if token == nil {
		return httperror.NewForBadRequest(&map[string]string{
			"token": "not found",
		})
	}

	// STEP 3: Revoke the token
	return uc.repo.RevokeToken(ctx, tokenID)
}
