// cloud/comiccoin/internal/iam/usecase/publicwallet/listbyfilter.go
package publicwallet

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/publicwallet"
)

type PublicWalletListByFilterUseCase interface {
	Execute(ctx context.Context, filter *dom.PublicWalletFilter) (*dom.PublicWalletFilterResult, error)
}

type publicWalletListByFilterUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom.Repository
}

func NewPublicWalletListByFilterUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo dom.Repository,
) PublicWalletListByFilterUseCase {
	return &publicWalletListByFilterUseCaseImpl{config, logger, repo}
}

func (uc *publicWalletListByFilterUseCaseImpl) Execute(ctx context.Context, filter *dom.PublicWalletFilter) (*dom.PublicWalletFilterResult, error) {
	// Validation
	e := make(map[string]string)
	if filter == nil {
		e["filter"] = "Filter is required"
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed validating", slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	// List from database
	return uc.repo.ListByFilter(ctx, filter)
}
