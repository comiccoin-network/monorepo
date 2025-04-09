// cloud/comiccoin/internal/iam/service/publicwallet/getbyaddress.go
package publicwalletdirectory

import (
	"context"
	"log/slog"

	"github.com/ethereum/go-ethereum/common"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/publicwallet"
	uc "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/usecase/publicwallet"
)

type GetPublicWalletsFromDirectoryByAddressService interface {
	GetByAddress(ctx context.Context, address *common.Address) (*dom.PublicWallet, error)
}

type getPublicWalletsFromDirectoryByAddressServiceImpl struct {
	config *config.Configuration
	logger *slog.Logger
	uc     uc.PublicWalletGetByAddressUseCase
}

func NewGetPublicWalletsFromDirectoryByAddressService(
	config *config.Configuration,
	logger *slog.Logger,
	uc uc.PublicWalletGetByAddressUseCase,
) GetPublicWalletsFromDirectoryByAddressService {
	return &getPublicWalletsFromDirectoryByAddressServiceImpl{
		config: config,
		logger: logger,
		uc:     uc,
	}
}

func (s *getPublicWalletsFromDirectoryByAddressServiceImpl) GetByAddress(ctx context.Context, address *common.Address) (*dom.PublicWallet, error) {
	s.logger.Debug("getting public wallet from directory by address", slog.String("address", address.Hex()))

	return s.uc.Execute(ctx, address)
}
