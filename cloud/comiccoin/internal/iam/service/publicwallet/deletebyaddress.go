// cloud/comiccoin/internal/iam/service/publicwallet/deletebyaddress.go
package publicwallet

import (
	"context"
	"log/slog"

	"github.com/ethereum/go-ethereum/common"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	uc "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/usecase/publicwallet"
)

type DeletePublicWalletByAddressService interface {
	DeleteByAddress(ctx context.Context, address *common.Address) error
}

type deletePublicWalletByAddressServiceImpl struct {
	config *config.Configuration
	logger *slog.Logger
	uc     uc.PublicWalletDeleteByAddressUseCase
}

func NewDeletePublicWalletByAddressService(
	config *config.Configuration,
	logger *slog.Logger,
	uc uc.PublicWalletDeleteByAddressUseCase,
) DeletePublicWalletByAddressService {
	return &deletePublicWalletByAddressServiceImpl{
		config: config,
		logger: logger,
		uc:     uc,
	}
}

func (s *deletePublicWalletByAddressServiceImpl) DeleteByAddress(ctx context.Context, address *common.Address) error {
	s.logger.Debug("deleting public wallet by address", slog.Any("address", address))

	return s.uc.Execute(ctx, address)
}
