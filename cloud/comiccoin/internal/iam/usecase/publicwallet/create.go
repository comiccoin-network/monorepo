// cloud/comiccoin/internal/iam/usecase/publicwallet/create.go
package publicwallet

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/publicwallet"
)

type PublicWalletCreateUseCase interface {
	Execute(ctx context.Context, publicWallet *dom.PublicWallet) error
}

type publicWalletCreateUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom.Repository
}

func NewPublicWalletCreateUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo dom.Repository,
) PublicWalletCreateUseCase {
	return &publicWalletCreateUseCaseImpl{config, logger, repo}
}

func (uc *publicWalletCreateUseCaseImpl) Execute(ctx context.Context, publicWallet *dom.PublicWallet) error {
	// Validation
	e := make(map[string]string)
	if publicWallet == nil {
		e["public_wallet"] = "Public wallet is required"
	} else {
		if publicWallet.Address == nil {
			e["address"] = "Address is required"
		} else {
			if publicWallet.Address.Hex() == "0x0000000000000000000000000000000000000000" {
				e["wallet_address"] = "Wallet address cannot be burn address"
			}
		}
		if publicWallet.ChainID == 0 {
			e["chain_id"] = "Chain ID is required"
		} else {
			if publicWallet.ChainID != uc.config.Blockchain.ChainID {
				e["chain_id"] = "Chain ID must match the blockchain chain ID"
			}
		}
		if publicWallet.Name == "" {
			e["name"] = "Name is required"
		}
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed validating", slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	// Insert into database
	return uc.repo.Create(ctx, publicWallet)
}
