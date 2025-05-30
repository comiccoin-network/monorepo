// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/usecase/user/listbyfilter.go
package user

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	dom_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/user"
)

type UserListByFilterUseCase interface {
	Execute(ctx context.Context, filter *dom_user.UserFilter) (*dom_user.UserFilterResult, error)
}

type userListByFilterUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_user.Repository
}

func NewUserListByFilterUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo dom_user.Repository,
) UserListByFilterUseCase {
	return &userListByFilterUseCaseImpl{config, logger, repo}
}

func (uc *userListByFilterUseCaseImpl) Execute(ctx context.Context, filter *dom_user.UserFilter) (*dom_user.UserFilterResult, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if filter == nil {
		e["filter"] = "User filter is required"
	} else {
		// Validate limit to prevent excessive data loads
		if filter.Limit > 1000 {
			filter.Limit = 1000
		}
	}

	if len(e) != 0 {
		uc.logger.Warn("Failed validating user list by filter",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: List from database.
	//

	uc.logger.Debug("Listing users by filter",
		slog.Any("role", filter.Role),
		slog.Any("status", filter.Status),
		slog.Any("limit", filter.Limit))

	return uc.repo.ListByFilter(ctx, filter)
}
