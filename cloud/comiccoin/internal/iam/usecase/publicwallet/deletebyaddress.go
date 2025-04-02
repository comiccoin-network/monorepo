// cloud/comiccoin/internal/iam/usecase/publicwallet/deleteByAddress.go
package publicwallet

import (
	"context"
	"log/slog"

	"github.com/ethereum/go-ethereum/common"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/publicwallet"
)

type PublicWalletDeleteByAddressUseCase interface {
	Execute(ctx context.Context, address *common.Address) error
}

type publicWalletDeleteByAddressUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom.Repository
}

func NewPublicWalletDeleteByAddressUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo dom.Repository,
) PublicWalletDeleteByAddressUseCase {
	return &publicWalletDeleteByAddressUseCaseImpl{config, logger, repo}
}

func (uc *publicWalletDeleteByAddressUseCaseImpl) Execute(ctx context.Context, address *common.Address) error {
	// Validation
	e := make(map[string]string)
	if address == nil {
		e["address"] = "Address is required"
	} else if address.Hex() == "0x0000000000000000000000000000000000000000" {
		e["address"] = "Cannot use burn address"
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed validating", slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	// Delete from database
	return uc.repo.DeleteByAddress(ctx, address)
}
