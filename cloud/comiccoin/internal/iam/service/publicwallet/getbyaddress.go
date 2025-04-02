// cloud/comiccoin/internal/iam/service/publicwallet/getbyaddress.go
package publicwallet

import (
	"context"
	"log/slog"

	"github.com/ethereum/go-ethereum/common"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/publicwallet"
	uc "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/usecase/publicwallet"
)

type GetPublicWalletByAddressService interface {
	GetByAddress(ctx context.Context, address *common.Address) (*dom.PublicWallet, error)
}

type getPublicWalletByAddressServiceImpl struct {
	config *config.Configuration
	logger *slog.Logger
	uc     uc.PublicWalletGetByAddressUseCase
}

func NewGetPublicWalletByAddressService(
	config *config.Configuration,
	logger *slog.Logger,
	uc uc.PublicWalletGetByAddressUseCase,
) GetPublicWalletByAddressService {
	return &getPublicWalletByAddressServiceImpl{
		config: config,
		logger: logger,
		uc:     uc,
	}
}

func (s *getPublicWalletByAddressServiceImpl) GetByAddress(ctx context.Context, address *common.Address) (*dom.PublicWallet, error) {
	s.logger.Debug("getting public wallet by address", slog.String("address", address.Hex()))

	return s.uc.Execute(ctx, address)
}
