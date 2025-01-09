package wallet

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/domain"
	"github.com/ethereum/go-ethereum/common"
)

type GetWalletUseCase struct {
	config *config.Configuration
	logger *slog.Logger
	repo   domain.WalletRepository
}

func NewGetWalletUseCase(config *config.Configuration, logger *slog.Logger, repo domain.WalletRepository) *GetWalletUseCase {
	return &GetWalletUseCase{config, logger, repo}
}

func (uc *GetWalletUseCase) Execute(ctx context.Context, address *common.Address) (*domain.Wallet, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if address == nil {
		e["address"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed getting wallet",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Insert into database.
	//

	return uc.repo.GetByAddress(ctx, address)
}