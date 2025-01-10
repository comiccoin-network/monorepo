package tenant

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/domain"
)

type TenantGetByNameUseCase interface {
	Execute(ctx context.Context, name string) (*domain.Tenant, error)
}

type tenantGetByNameUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   domain.TenantRepository
}

func NewTenantGetByNameUseCase(config *config.Configuration, logger *slog.Logger, repo domain.TenantRepository) TenantGetByNameUseCase {
	return &tenantGetByNameUseCaseImpl{config, logger, repo}
}

func (uc *tenantGetByNameUseCaseImpl) Execute(ctx context.Context, name string) (*domain.Tenant, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if name == "" {
		e["name"] = "missing value"
	} else {
		//TODO: IMPL.
	}
	if len(e) != 0 {
		uc.logger.Warn("Validation failed for upsert",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Upsert our strucutre.
	//

	//
	// STEP 3: Insert into database.
	//

	return uc.repo.GetByName(ctx, name)
}
