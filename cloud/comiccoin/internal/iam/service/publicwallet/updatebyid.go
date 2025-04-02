// cloud/comiccoin/internal/iam/service/publicwallet/updatebyid.go
package publicwallet

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/publicwallet"
	uc "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/usecase/publicwallet"
)

type UpdatePublicWalletByIDService interface {
	UpdateByID(ctx context.Context, publicWallet *dom.PublicWallet) error
}

type updatePublicWalletByIDServiceImpl struct {
	config *config.Configuration
	logger *slog.Logger
	uc     uc.PublicWalletUpdateByIDUseCase
}

func NewUpdatePublicWalletByIDService(
	config *config.Configuration,
	logger *slog.Logger,
	uc uc.PublicWalletUpdateByIDUseCase,
) UpdatePublicWalletByIDService {
	return &updatePublicWalletByIDServiceImpl{
		config: config,
		logger: logger,
		uc:     uc,
	}
}

func (s *updatePublicWalletByIDServiceImpl) UpdateByID(ctx context.Context, publicWallet *dom.PublicWallet) error {
	s.logger.Debug("updating public wallet by ID",
		slog.Any("id", publicWallet.ID),
		slog.Any("address", publicWallet.Address))

	return s.uc.Execute(ctx, publicWallet)
}
