package bannedipaddress

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	dom_banip "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/bannedipaddress"
)

type CreateBannedIPAddressUseCase interface {
	Execute(ctx context.Context, bannedIPAddress *dom_banip.BannedIPAddress) error
}

type createBannedIPAddressUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_banip.Repository
}

func NewCreateBannedIPAddressUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo dom_banip.Repository,
) CreateBannedIPAddressUseCase {
	return &createBannedIPAddressUseCaseImpl{config, logger, repo}
}

func (uc *createBannedIPAddressUseCaseImpl) Execute(ctx context.Context, bannedIPAddress *dom_banip.BannedIPAddress) error {
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
