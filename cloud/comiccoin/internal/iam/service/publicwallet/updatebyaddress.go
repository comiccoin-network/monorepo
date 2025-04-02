// cloud/comiccoin/internal/iam/service/publicwallet/updatebyaddress.go
package publicwallet

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/publicwallet"
	uc "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/usecase/publicwallet"
)

type UpdatePublicWalletByAddressService interface {
	UpdateByAddress(ctx context.Context, publicWallet *dom.PublicWallet) error
}

type updatePublicWalletByAddressServiceImpl struct {
	config *config.Configuration
	logger *slog.Logger
	uc     uc.PublicWalletUpdateByAddressUseCase
}

func NewUpdatePublicWalletByAddressService(
	config *config.Configuration,
	logger *slog.Logger,
	uc uc.PublicWalletUpdateByAddressUseCase,
) UpdatePublicWalletByAddressService {
	return &updatePublicWalletByAddressServiceImpl{
		config: config,
		logger: logger,
		uc:     uc,
	}
}

func (s *updatePublicWalletByAddressServiceImpl) UpdateByAddress(ctx context.Context, publicWallet *dom.PublicWallet) error {
	s.logger.Debug("updating public wallet by address",
		slog.Any("address", publicWallet.Address))

	return s.uc.Execute(ctx, publicWallet)
}
