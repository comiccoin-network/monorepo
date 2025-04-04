// cloud/comiccoin/internal/iam/usecase/publicwallet/listbyfilter.go
package publicwallet

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/publicwallet"
)

type PublicWalletGetTotalViewCountByFilterUseCase interface {
	Execute(ctx context.Context, filter *dom.PublicWalletFilter) (uint64, error)
}

type PublicWalletGetTotalViewCountByFilterUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom.Repository
}

func NewPublicWalletGetTotalViewCountByFilterUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo dom.Repository,
) PublicWalletGetTotalViewCountByFilterUseCase {
	return &PublicWalletGetTotalViewCountByFilterUseCaseImpl{config, logger, repo}
}

func (uc *PublicWalletGetTotalViewCountByFilterUseCaseImpl) Execute(ctx context.Context, filter *dom.PublicWalletFilter) (uint64, error) {
	// Validation
	e := make(map[string]string)
	if filter == nil {
		e["filter"] = "Filter is required"
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed validating", slog.Any("error", e))
		return 0, httperror.NewForBadRequest(&e)
	}

	// List from database
	return uc.repo.GetTotalViewCountByFilter(ctx, filter)
}
