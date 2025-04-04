// cloud/comiccoin/internal/iam/service/publicwallet/listbyfilter.go
package publicwallet

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/publicwallet"
	uc "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/usecase/publicwallet"
)

type ListPublicWalletsByFilterService interface {
	ListByFilter(ctx context.Context, filter *dom.PublicWalletFilter) (*dom.PublicWalletFilterResult, error)
}

type listPublicWalletsByFilterServiceImpl struct {
	config *config.Configuration
	logger *slog.Logger
	uc     uc.PublicWalletListByFilterUseCase
}

func NewListPublicWalletsByFilterService(
	config *config.Configuration,
	logger *slog.Logger,
	uc uc.PublicWalletListByFilterUseCase,
) ListPublicWalletsByFilterService {
	return &listPublicWalletsByFilterServiceImpl{
		config: config,
		logger: logger,
		uc:     uc,
	}
}

func (s *listPublicWalletsByFilterServiceImpl) ListByFilter(ctx context.Context, filter *dom.PublicWalletFilter) (*dom.PublicWalletFilterResult, error) {
	s.logger.Debug("listing public wallets by filter",
		slog.Any("created_by_user_id", filter.CreatedByUserID),
		slog.Any("limit", filter.Limit))

	return s.uc.Execute(ctx, filter)
}
