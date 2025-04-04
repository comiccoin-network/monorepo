// cloud/comiccoin/internal/iam/usecase/publicwallet/totaluniqueviewcount.go
package publicwallet

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/publicwallet"
)

type PublicWalletGetTotalUniqueViewCountByFilterUseCase interface {
	Execute(ctx context.Context, filter *dom.PublicWalletFilter) (uint64, error)
}

type PublicWalletGetTotalUniqueViewCountByFilterUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom.Repository
}

func NewPublicWalletGetTotalUniqueViewCountByFilterUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo dom.Repository,
) PublicWalletGetTotalUniqueViewCountByFilterUseCase {
	return &PublicWalletGetTotalUniqueViewCountByFilterUseCaseImpl{config, logger, repo}
}

func (uc *PublicWalletGetTotalUniqueViewCountByFilterUseCaseImpl) Execute(ctx context.Context, filter *dom.PublicWalletFilter) (uint64, error) {
	// Validation
	e := make(map[string]string)
	if filter == nil {
		e["filter"] = "Filter is required"
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed validating", slog.Any("error", e))
		return 0, httperror.NewForBadRequest(&e)
	}

	// Get from database
	return uc.repo.GetTotalUniqueViewCountByFilter(ctx, filter)
}
