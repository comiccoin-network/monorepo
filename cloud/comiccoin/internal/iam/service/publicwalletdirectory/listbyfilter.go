// cloud/comiccoin/internal/iam/service/publicwallet/listbyfilter.go
package publicwalletdirectory

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/publicwallet"
	uc "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/usecase/publicwallet"
)

type ListPublicWalletsFromDirectoryByFilterService interface {
	ListByFilter(ctx context.Context, filter *dom.PublicWalletFilter) (*dom.PublicWalletFilterResult, error)
}

type listPublicWalletsFromDirectoryByFilterServiceImpl struct {
	config *config.Configuration
	logger *slog.Logger
	uc     uc.PublicWalletListByFilterUseCase
}

func NewListPublicWalletsFromDirectoryByFilterService(
	config *config.Configuration,
	logger *slog.Logger,
	uc uc.PublicWalletListByFilterUseCase,
) ListPublicWalletsFromDirectoryByFilterService {
	return &listPublicWalletsFromDirectoryByFilterServiceImpl{
		config: config,
		logger: logger,
		uc:     uc,
	}
}

func (s *listPublicWalletsFromDirectoryByFilterServiceImpl) ListByFilter(ctx context.Context, filter *dom.PublicWalletFilter) (*dom.PublicWalletFilterResult, error) {
	s.logger.Debug("listing public wallets from directory by filter",
		slog.Any("created_by_user_id", filter.CreatedByUserID),
		slog.Any("limit", filter.Limit))

	return s.uc.Execute(ctx, filter)
}
