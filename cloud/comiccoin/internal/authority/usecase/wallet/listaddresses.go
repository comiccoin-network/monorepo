package wallet

import (
	"context"
	"log/slog"

	"github.com/ethereum/go-ethereum/common"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/domain"
)

type ListAllAddressesWalletUseCase interface {
	Execute(ctx context.Context) ([]*common.Address, error)
}

type listAllAddressesWalletUseCaseImpl struct {
	logger *slog.Logger
	repo   domain.WalletRepository
}

func NewListAllAddressesWalletUseCase(logger *slog.Logger, repo domain.WalletRepository) ListAllAddressesWalletUseCase {
	return &listAllAddressesWalletUseCaseImpl{logger, repo}
}

func (uc *listAllAddressesWalletUseCaseImpl) Execute(ctx context.Context) ([]*common.Address, error) {
	addresses, err := uc.repo.ListAllAddresses(ctx)
	if err != nil {
		uc.logger.Error("Failed listing all by addresses",
			slog.Any("error", err))
		return nil, err
	}
	uc.logger.Debug("Addresses listed",
		slog.Any("addresses", addresses))
	return addresses, nil
}
