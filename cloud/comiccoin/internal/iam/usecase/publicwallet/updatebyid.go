// cloud/comiccoin/internal/iam/usecase/publicwallet/updatebyid.go
package publicwallet

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/publicwallet"
)

type PublicWalletUpdateByIDUseCase interface {
	Execute(ctx context.Context, publicWallet *dom.PublicWallet) error
}

type publicWalletUpdateByIDUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom.Repository
}

func NewPublicWalletUpdateByIDUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo dom.Repository,
) PublicWalletUpdateByIDUseCase {
	return &publicWalletUpdateByIDUseCaseImpl{config, logger, repo}
}

func (uc *publicWalletUpdateByIDUseCaseImpl) Execute(ctx context.Context, publicWallet *dom.PublicWallet) error {
	// Validation
	e := make(map[string]string)
	if publicWallet == nil {
		e["public_wallet"] = "Public wallet is required"
	} else {
		if publicWallet.ID.IsZero() {
			e["id"] = "ID is required"
		}
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed validating", slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	// Update in database
	return uc.repo.UpdateByID(ctx, publicWallet)
}
