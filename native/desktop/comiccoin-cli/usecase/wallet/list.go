package wallet

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"
)

type ListAllWalletUseCase interface {
	Execute(ctx context.Context) ([]*domain.Wallet, error)
}

type listAllWalletUseCaseImpl struct {
	logger *slog.Logger
	repo   domain.WalletRepository
}

func NewListAllWalletUseCase(logger *slog.Logger, repo domain.WalletRepository) ListAllWalletUseCase {
	return &listAllWalletUseCaseImpl{logger, repo}
}

func (uc *listAllWalletUseCaseImpl) Execute(ctx context.Context) ([]*domain.Wallet, error) {
	return uc.repo.ListAll(ctx)
}
