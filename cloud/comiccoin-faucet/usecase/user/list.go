package user

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/domain"
)

type UserListByFilterUseCase interface {
	Execute(ctx context.Context, filter *domain.UserFilter) (*domain.UserFilterResult, error)
}

type userListByFilterUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   domain.UserRepository
}

func NewUserListByFilterUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo domain.UserRepository,
) UserListByFilterUseCase {
	return &userListByFilterUseCaseImpl{config, logger, repo}
}

func (uc *userListByFilterUseCaseImpl) Execute(ctx context.Context, filter *domain.UserFilter) (*domain.UserFilterResult, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if filter == nil {
		e["filter"] = "User is required"
	} else {
		if filter.TenantID.IsZero() {
			e["tenant_id"] = "Tenant ID is required"
		}
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed validating",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Insert into database.
	//

	return uc.repo.ListByFilter(ctx, filter)
}
