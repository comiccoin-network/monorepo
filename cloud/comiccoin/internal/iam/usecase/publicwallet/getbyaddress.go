// cloud/comiccoin/internal/iam/usecase/publicwallet/getbyaddress.go
package publicwallet

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/publicwallet"
	"github.com/ethereum/go-ethereum/common"
)

type PublicWalletGetByAddressUseCase interface {
	Execute(ctx context.Context, address *common.Address) (*dom.PublicWallet, error)
}

type publicWalletGetByAddressUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom.Repository
}

func NewPublicWalletGetByAddressUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo dom.Repository,
) PublicWalletGetByAddressUseCase {
	return &publicWalletGetByAddressUseCaseImpl{config, logger, repo}
}

func (uc *publicWalletGetByAddressUseCaseImpl) Execute(ctx context.Context, address *common.Address) (*dom.PublicWallet, error) {
	// Validation
	e := make(map[string]string)
	if address == nil {
		e["address"] = "Address is required"
	} else if address.Hex() == "0x0000000000000000000000000000000000000000" {
		e["address"] = "Cannot use burn address"
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed validating", slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	// Get from database
	return uc.repo.GetByAddress(ctx, address)
}
