// cloud/comiccoin/internal/iam/service/publicwallet/deletebyid.go
package publicwallet

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	uc "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/usecase/publicwallet"
)

type DeletePublicWalletByIDService interface {
	DeleteByID(ctx context.Context, id primitive.ObjectID) error
}

type deletePublicWalletByIDServiceImpl struct {
	config *config.Configuration
	logger *slog.Logger
	uc     uc.PublicWalletDeleteByIDUseCase
}

func NewDeletePublicWalletByIDService(
	config *config.Configuration,
	logger *slog.Logger,
	uc uc.PublicWalletDeleteByIDUseCase,
) DeletePublicWalletByIDService {
	return &deletePublicWalletByIDServiceImpl{
		config: config,
		logger: logger,
		uc:     uc,
	}
}

func (s *deletePublicWalletByIDServiceImpl) DeleteByID(ctx context.Context, id primitive.ObjectID) error {
	s.logger.Debug("deleting public wallet by ID", slog.Any("id", id))

	return s.uc.Execute(ctx, id)
}
