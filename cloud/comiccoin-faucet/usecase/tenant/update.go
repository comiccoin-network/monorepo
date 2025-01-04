package tenant

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/domain"
)

//
// Copied from `github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase`
//

type TenantUpdateUseCase struct {
	config *config.Configuration
	logger *slog.Logger
	repo   domain.TenantRepository
}

func NewTenantUpdateUseCase(config *config.Configuration, logger *slog.Logger, repo domain.TenantRepository) *TenantUpdateUseCase {
	return &TenantUpdateUseCase{config, logger, repo}
}

func (uc *TenantUpdateUseCase) Execute(ctx context.Context, t *domain.Tenant) error {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if t == nil {
		e["tenant"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("Validation failed for upsert",
			slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Update in database.
	//

	return uc.repo.UpdateByID(ctx, t)
}
