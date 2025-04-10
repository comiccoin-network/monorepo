// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/usecase/user/countbyfilter.go
package user

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	dom_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/user"
)

type UserCountByFilterUseCase interface {
	Execute(ctx context.Context, filter *dom_user.UserFilter) (uint64, error)
}

type userCountByFilterUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_user.Repository
}

func NewUserCountByFilterUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo dom_user.Repository,
) UserCountByFilterUseCase {
	return &userCountByFilterUseCaseImpl{config, logger, repo}
}

func (uc *userCountByFilterUseCaseImpl) Execute(ctx context.Context, filter *dom_user.UserFilter) (uint64, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if filter == nil {
		e["filter"] = "User filter is required"
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed validating user count by filter",
			slog.Any("error", e))
		return 0, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Count in database.
	//

	uc.logger.Debug("Counting users by filter",
		slog.Any("role", filter.Role),
		slog.Any("status", filter.Status))

	return uc.repo.CountByFilter(ctx, filter)
}
