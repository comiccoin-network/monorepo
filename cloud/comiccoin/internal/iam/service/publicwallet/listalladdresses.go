// cloud/comiccoin/internal/iam/service/publicwallet/listalladdresses.go
package publicwallet

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	uc "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/usecase/publicwallet"
	"github.com/ethereum/go-ethereum/common"
)

type ListAllPublicWalletAddressesService interface {
	ListAllAddresses(ctx context.Context) ([]*common.Address, error)
}

type listAllPublicWalletAddressesServiceImpl struct {
	config *config.Configuration
	logger *slog.Logger
	uc     uc.PublicWalletListAllAddressesUseCase
}

func NewListAllPublicWalletAddressesService(
	config *config.Configuration,
	logger *slog.Logger,
	uc uc.PublicWalletListAllAddressesUseCase,
) ListAllPublicWalletAddressesService {
	return &listAllPublicWalletAddressesServiceImpl{
		config: config,
		logger: logger,
		uc:     uc,
	}
}

func (s *listAllPublicWalletAddressesServiceImpl) ListAllAddresses(ctx context.Context) ([]*common.Address, error) {
	s.logger.Debug("listing all public wallet addresses")

	return s.uc.Execute(ctx)
}
