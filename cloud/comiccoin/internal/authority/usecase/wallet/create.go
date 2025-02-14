package wallet

import (
	"context"
	"log/slog"

	"github.com/ethereum/go-ethereum/common"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/domain"
)

type CreateWalletUseCase interface {
	Execute(ctx context.Context, address *common.Address, keystoreBytes []byte, label string) error
}

type createWalletUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   domain.WalletRepository
}

func NewCreateWalletUseCase(config *config.Configuration, logger *slog.Logger, repo domain.WalletRepository) CreateWalletUseCase {
	return &createWalletUseCaseImpl{config, logger, repo}
}

func (uc *createWalletUseCaseImpl) Execute(ctx context.Context, address *common.Address, keystoreBytes []byte, label string) error {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if address == nil {
		e["address"] = "missing value"
	}
	if keystoreBytes == nil {
		e["keystore_bytes"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed creating new wallet",
			slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Create our strucutre.
	//

	wallet := &domain.Wallet{
		Address:       address,
		KeystoreBytes: keystoreBytes,
		Label:         label,
	}

	//
	// STEP 3: Insert into database.
	//

	return uc.repo.Upsert(ctx, wallet)
}
