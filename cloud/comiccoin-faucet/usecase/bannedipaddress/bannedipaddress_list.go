package bannedipaddress

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/domain"
)

type BannedIPAddressListAllValuesUseCase struct {
	config *config.Configuration
	logger *slog.Logger
	repo   domain.BannedIPAddressRepository
}

func NewBannedIPAddressListAllValuesUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo domain.BannedIPAddressRepository,
) *BannedIPAddressListAllValuesUseCase {
	return &BannedIPAddressListAllValuesUseCase{config, logger, repo}
}

func (uc *BannedIPAddressListAllValuesUseCase) Execute(ctx context.Context) ([]string, error) {
	return uc.repo.ListAllValues(ctx)
}
