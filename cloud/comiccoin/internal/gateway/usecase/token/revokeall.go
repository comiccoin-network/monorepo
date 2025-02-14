// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/usecase/token/revokeall.go
package token

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	dom_token "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/domain/token"
)

type TokenRevokeAllFederatedIdentityTokensUseCase interface {
	Execute(ctx context.Context, federatedidentityID string) error
}

type tokenRevokeAllFederatedIdentityTokensUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_token.Repository
}

func NewTokenRevokeAllFederatedIdentityTokensUseCase(config *config.Configuration, logger *slog.Logger, repo dom_token.Repository) TokenRevokeAllFederatedIdentityTokensUseCase {
	return &tokenRevokeAllFederatedIdentityTokensUseCaseImpl{config, logger, repo}
}

func (uc *tokenRevokeAllFederatedIdentityTokensUseCaseImpl) Execute(ctx context.Context, federatedidentityID string) error {
	// STEP 1: Validation
	e := make(map[string]string)
	if federatedidentityID == "" {
		e["federatedidentity_id"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("validation failed for federatedidentity token revocation",
			slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	// STEP 2: Revoke all federatedidentity tokens
	if err := uc.repo.RevokeAllFederatedIdentityTokens(ctx, federatedidentityID); err != nil {
		uc.logger.Error("failed to revoke all federatedidentity tokens",
			slog.String("federatedidentity_id", federatedidentityID),
			slog.Any("error", err))
		return err
	}

	return nil
}
