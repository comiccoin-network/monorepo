package tenant

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/domain"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type TenantGetByIDUseCase interface {
	Execute(ctx context.Context, id primitive.ObjectID) (*domain.Tenant, error)
}

type tenantGetByIDUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   domain.TenantRepository
}

func NewTenantGetByIDUseCase(config *config.Configuration, logger *slog.Logger, repo domain.TenantRepository) TenantGetByIDUseCase {
	return &tenantGetByIDUseCaseImpl{config, logger, repo}
}

func (uc *tenantGetByIDUseCaseImpl) Execute(ctx context.Context, id primitive.ObjectID) (*domain.Tenant, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if id.IsZero() {
		e["id"] = "missing value"
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

	return uc.repo.GetByID(ctx, id)
}
