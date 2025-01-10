package bannedipaddress

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/domain"
)

type BannedIPAddressListAllValuesUseCase interface {
	Execute(ctx context.Context) ([]string, error)
}

type bannedIPAddressListAllValuesUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   domain.BannedIPAddressRepository
}

func NewBannedIPAddressListAllValuesUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo domain.BannedIPAddressRepository,
) BannedIPAddressListAllValuesUseCase {
	return &bannedIPAddressListAllValuesUseCaseImpl{config, logger, repo}
}

func (uc *bannedIPAddressListAllValuesUseCaseImpl) Execute(ctx context.Context) ([]string, error) {
	return uc.repo.ListAllValues(ctx)
}
