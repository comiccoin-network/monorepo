package user

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	dom_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/nameservice/domain/user"
)

type UserListAllUseCase interface {
	Execute(ctx context.Context) ([]*dom_user.User, error)
}

type userListAllUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_user.Repository
}

func NewUserListAllUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo dom_user.Repository,
) UserListAllUseCase {
	return &userListAllUseCaseImpl{
		config: config,
		logger: logger,
		repo:   repo,
	}
}

func (uc *userListAllUseCaseImpl) Execute(ctx context.Context) ([]*dom_user.User, error) {
	uc.logger.Debug("executing list all users use case")

	users, err := uc.repo.ListAll(ctx)
	if err != nil {
		uc.logger.Error("failed to list all users", slog.Any("error", err))
		return nil, err
	}

	return users, nil
}
