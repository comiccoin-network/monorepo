package bannedipaddress

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/domain"
)

type CreateBannedIPAddressUseCase interface {
	Execute(ctx context.Context, bannedIPAddress *domain.BannedIPAddress) error
}

type createBannedIPAddressUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   domain.BannedIPAddressRepository
}

func NewCreateBannedIPAddressUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo domain.BannedIPAddressRepository,
) CreateBannedIPAddressUseCase {
	return &createBannedIPAddressUseCaseImpl{config, logger, repo}
}

func (uc *createBannedIPAddressUseCaseImpl) Execute(ctx context.Context, bannedIPAddress *domain.BannedIPAddress) error {
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
