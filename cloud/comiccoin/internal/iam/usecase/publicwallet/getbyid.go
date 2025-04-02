// cloud/comiccoin/internal/iam/usecase/publicwallet/getbyid.go
package publicwallet

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/publicwallet"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type PublicWalletGetByIDUseCase interface {
	Execute(ctx context.Context, id primitive.ObjectID) (*dom.PublicWallet, error)
}

type publicWalletGetByIDUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom.Repository
}

func NewPublicWalletGetByIDUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo dom.Repository,
) PublicWalletGetByIDUseCase {
	return &publicWalletGetByIDUseCaseImpl{config, logger, repo}
}

func (uc *publicWalletGetByIDUseCaseImpl) Execute(ctx context.Context, id primitive.ObjectID) (*dom.PublicWallet, error) {
	// Validation
	e := make(map[string]string)
	if id.IsZero() {
		e["id"] = "ID is required"
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed validating", slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	// Get from database
	return uc.repo.GetByID(ctx, id)
}
