package usecase

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/domain"
)

type CreateBannedIPAddressUseCase struct {
	config *config.Configuration
	logger *slog.Logger
	repo   domain.BannedIPAddressRepository
}

func NewCreateBannedIPAddressUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo domain.BannedIPAddressRepository,
) *CreateBannedIPAddressUseCase {
	return &CreateBannedIPAddressUseCase{config, logger, repo}
}

func (uc *CreateBannedIPAddressUseCase) Execute(ctx context.Context, bannedIPAddress *domain.BannedIPAddress) error {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if bannedIPAddress == nil {
		e["banned_ip_address"] = "Banned IP address is required"
	} else {

	}
	if len(e) != 0 {
		uc.logger.Warn("Failed validating",
			slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Insert into database.
	//

	return uc.repo.Create(ctx, bannedIPAddress)
}
