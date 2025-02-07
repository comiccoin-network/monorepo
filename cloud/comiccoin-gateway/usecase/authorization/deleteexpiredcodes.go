// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/usecase/authorization/deleteexpiredcodes.go
package authorization

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/config"
	dom_auth "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/domain/authorization"
)

type AuthorizationDeleteExpiredCodesUseCase interface {
	Execute(ctx context.Context) error
}

type authorizationDeleteExpiredCodesUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_auth.Repository
}

func NewAuthorizationDeleteExpiredCodesUseCase(config *config.Configuration, logger *slog.Logger, repo dom_auth.Repository) AuthorizationDeleteExpiredCodesUseCase {
	return &authorizationDeleteExpiredCodesUseCaseImpl{config, logger, repo}
}

func (uc *authorizationDeleteExpiredCodesUseCaseImpl) Execute(ctx context.Context) error {
	// Note: This method doesn't need validation as it doesn't take any parameters

	if err := uc.repo.DeleteExpiredCodes(ctx); err != nil {
		uc.logger.Error("failed to delete expired authorization codes",
			slog.Any("error", err))
		return err
	}

	return nil
}
