// cloud/comiccoin/internal/iam/service/publicwallet/getbyid.go
package publicwallet

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/publicwallet"
	uc "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/usecase/publicwallet"
)

type GetPublicWalletByIDService interface {
	GetByID(ctx context.Context, id primitive.ObjectID) (*dom.PublicWallet, error)
}

type getPublicWalletByIDServiceImpl struct {
	config *config.Configuration
	logger *slog.Logger
	uc     uc.PublicWalletGetByIDUseCase
}

func NewGetPublicWalletByIDService(
	config *config.Configuration,
	logger *slog.Logger,
	uc uc.PublicWalletGetByIDUseCase,
) GetPublicWalletByIDService {
	return &getPublicWalletByIDServiceImpl{
		config: config,
		logger: logger,
		uc:     uc,
	}
}

func (s *getPublicWalletByIDServiceImpl) GetByID(ctx context.Context, id primitive.ObjectID) (*dom.PublicWallet, error) {
	s.logger.Debug("getting public wallet by ID", slog.Any("id", id))

	return s.uc.Execute(ctx, id)
}
