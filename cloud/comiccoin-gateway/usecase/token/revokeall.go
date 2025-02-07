// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/usecase/token/revokeall.go
package token

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/config"
	dom_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/domain/token"
)

type TokenRevokeAllUserTokensUseCase interface {
	Execute(ctx context.Context, userID string) error
}

type tokenRevokeAllUserTokensUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_token.Repository
}

func NewTokenRevokeAllUserTokensUseCase(config *config.Configuration, logger *slog.Logger, repo dom_token.Repository) TokenRevokeAllUserTokensUseCase {
	return &tokenRevokeAllUserTokensUseCaseImpl{config, logger, repo}
}

func (uc *tokenRevokeAllUserTokensUseCaseImpl) Execute(ctx context.Context, userID string) error {
	// STEP 1: Validation
	e := make(map[string]string)
	if userID == "" {
		e["user_id"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("validation failed for user token revocation",
			slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	// STEP 2: Revoke all user tokens
	if err := uc.repo.RevokeAllUserTokens(ctx, userID); err != nil {
		uc.logger.Error("failed to revoke all user tokens",
			slog.String("user_id", userID),
			slog.Any("error", err))
		return err
	}

	return nil
}
