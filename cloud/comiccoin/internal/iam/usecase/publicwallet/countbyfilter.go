// cloud/comiccoin/internal/iam/usecase/publicwallet/countbyfilter.go
package publicwallet

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/publicwallet"
)

type PublicWalletCountByFilterUseCase interface {
	Execute(ctx context.Context, filter *dom.PublicWalletFilter) (uint64, error)
}

type publicWalletCountByFilterUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom.Repository
}

func NewPublicWalletCountByFilterUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo dom.Repository,
) PublicWalletCountByFilterUseCase {
	return &publicWalletCountByFilterUseCaseImpl{config, logger, repo}
}

func (uc *publicWalletCountByFilterUseCaseImpl) Execute(ctx context.Context, filter *dom.PublicWalletFilter) (uint64, error) {
	// Validation
	e := make(map[string]string)
	if filter == nil {
		e["filter"] = "Filter is required"
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed validating", slog.Any("error", e))
		return 0, httperror.NewForBadRequest(&e)
	}

	// Count from database
	return uc.repo.CountByFilter(ctx, filter)
}
