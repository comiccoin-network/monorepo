// cloud/comiccoin/internal/iam/usecase/publicwallet/updatebyaddress.go
package publicwallet

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/publicwallet"
)

type PublicWalletUpdateByAddressUseCase interface {
	Execute(ctx context.Context, publicWallet *dom.PublicWallet) error
}

type publicWalletUpdateByAddressUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom.Repository
}

func NewPublicWalletUpdateByAddressUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo dom.Repository,
) PublicWalletUpdateByAddressUseCase {
	return &publicWalletUpdateByAddressUseCaseImpl{config, logger, repo}
}

func (uc *publicWalletUpdateByAddressUseCaseImpl) Execute(ctx context.Context, publicWallet *dom.PublicWallet) error {
	// Validation
	e := make(map[string]string)
	if publicWallet == nil {
		e["public_wallet"] = "Public wallet is required"
	} else {
		if publicWallet.Address == nil {
			e["address"] = "Address is required"
		}
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed validating", slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	// Update in database
	return uc.repo.UpdateByAddress(ctx, publicWallet)
}
