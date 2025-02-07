// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/usecase/application/findbyappid.go
package application

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/config"
	dom_app "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/domain/application"
)

type ApplicationFindByAppIDUseCase interface {
	Execute(ctx context.Context, appID string) (*dom_app.Application, error)
}

type applicationFindByAppIDUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_app.Repository
}

func NewApplicationFindByAppIDUseCase(config *config.Configuration, logger *slog.Logger, repo dom_app.Repository) ApplicationFindByAppIDUseCase {
	return &applicationFindByAppIDUseCaseImpl{config, logger, repo}
}

func (uc *applicationFindByAppIDUseCaseImpl) Execute(ctx context.Context, appID string) (*dom_app.Application, error) {
	// STEP 1: Validation
	e := make(map[string]string)
	if appID == "" {
		e["app_id"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("validation failed for application lookup",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	// STEP 2: Get from database
	return uc.repo.FindByAppID(ctx, appID)
}
