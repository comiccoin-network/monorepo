package service

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase"
)

type WalletListService struct {
	config               *config.Configuration
	logger               *slog.Logger
	listAllWalletUseCase *usecase.ListAllWalletUseCase
}

func NewWalletListService(
	cfg *config.Configuration,
	logger *slog.Logger,
	uc *usecase.ListAllWalletUseCase,
) *WalletListService {
	return &WalletListService{cfg, logger, uc}
}

func (s *WalletListService) Execute(ctx context.Context) ([]*domain.Wallet, error) {
	return s.listAllWalletUseCase.Execute(ctx)
}
