package bannedipaddress

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	dom_banip "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/bannedipaddress"
)

type BannedIPAddressListAllValuesUseCase interface {
	Execute(ctx context.Context) ([]string, error)
}

type bannedIPAddressListAllValuesUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_banip.Repository
}

func NewBannedIPAddressListAllValuesUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo dom_banip.Repository,
) BannedIPAddressListAllValuesUseCase {
	return &bannedIPAddressListAllValuesUseCaseImpl{config, logger, repo}
}

func (uc *bannedIPAddressListAllValuesUseCaseImpl) Execute(ctx context.Context) ([]string, error) {
	return uc.repo.ListAllValues(ctx)
}
