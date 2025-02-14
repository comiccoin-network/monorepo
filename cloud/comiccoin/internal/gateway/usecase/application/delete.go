// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/usecase/application/delete.go
package application

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	dom_app "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/domain/application"
)

type ApplicationDeleteUseCase interface {
	Execute(ctx context.Context, appID string) error
}

type applicationDeleteUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_app.Repository
}

func NewApplicationDeleteUseCase(config *config.Configuration, logger *slog.Logger, repo dom_app.Repository) ApplicationDeleteUseCase {
	return &applicationDeleteUseCaseImpl{config, logger, repo}
}

func (uc *applicationDeleteUseCaseImpl) Execute(ctx context.Context, appID string) error {
	// STEP 1: Validation
	e := make(map[string]string)
	if appID == "" {
		e["app_id"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("validation failed for application deletion",
			slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	// STEP 2: Delete from database
	return uc.repo.Delete(ctx, appID)
}
