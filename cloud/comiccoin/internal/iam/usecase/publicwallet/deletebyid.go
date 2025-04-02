// cloud/comiccoin/internal/iam/usecase/publicwallet/deletebyid.go
package publicwallet

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/publicwallet"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type PublicWalletDeleteByIDUseCase interface {
	Execute(ctx context.Context, id primitive.ObjectID) error
}

type publicWalletDeleteByIDUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom.Repository
}

func NewPublicWalletDeleteByIDUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo dom.Repository,
) PublicWalletDeleteByIDUseCase {
	return &publicWalletDeleteByIDUseCaseImpl{config, logger, repo}
}

func (uc *publicWalletDeleteByIDUseCaseImpl) Execute(ctx context.Context, id primitive.ObjectID) error {
	// Validation
	e := make(map[string]string)
	if id.IsZero() {
		e["id"] = "ID is required"
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed validating", slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	// Delete from database
	return uc.repo.DeleteByID(ctx, id)
}
