// cloud/comiccoin/internal/iam/service/publicwallet/create.go
package publicwallet

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/publicwallet"
	uc "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/usecase/publicwallet"
)

type CreatePublicWalletService interface {
	Create(ctx context.Context, publicWallet *dom.PublicWallet) error
}

type createPublicWalletServiceImpl struct {
	config *config.Configuration
	logger *slog.Logger
	uc     uc.PublicWalletCreateUseCase
}

func NewCreatePublicWalletService(
	config *config.Configuration,
	logger *slog.Logger,
	uc uc.PublicWalletCreateUseCase,
) CreatePublicWalletService {
	return &createPublicWalletServiceImpl{
		config: config,
		logger: logger,
		uc:     uc,
	}
}

func (s *createPublicWalletServiceImpl) Create(ctx context.Context, publicWallet *dom.PublicWallet) error {
	s.logger.Debug("creating public wallet",
		slog.Any("address", publicWallet.Address),
		slog.String("name", publicWallet.Name))

	return s.uc.Execute(ctx, publicWallet)
}
