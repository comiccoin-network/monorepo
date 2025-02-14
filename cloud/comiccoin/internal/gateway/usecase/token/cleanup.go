// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/usecase/token/cleanup.go
package token

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	dom_token "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/domain/token"
)

type TokenDeleteExpiredUseCase interface {
	Execute(ctx context.Context) error
}

type tokenDeleteExpiredUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_token.Repository
}

func NewTokenDeleteExpiredUseCase(config *config.Configuration, logger *slog.Logger, repo dom_token.Repository) TokenDeleteExpiredUseCase {
	return &tokenDeleteExpiredUseCaseImpl{config, logger, repo}
}

func (uc *tokenDeleteExpiredUseCaseImpl) Execute(ctx context.Context) error {
	// Note: This method doesn't need validation as it doesn't take any parameters

	if err := uc.repo.DeleteExpiredTokens(ctx); err != nil {
		uc.logger.Error("failed to delete expired tokens",
			slog.Any("error", err))
		return err
	}

	return nil
}
