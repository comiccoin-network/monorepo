// cloud/comiccoin/internal/iam/service/publicwallet/countbyfilter.go
package publicwallet

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/publicwallet"
	uc "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/usecase/publicwallet"
)

type CountPublicWalletsByFilterService interface {
	CountByFilter(ctx context.Context, filter *dom.PublicWalletFilter) (uint64, error)
}

type countPublicWalletsByFilterServiceImpl struct {
	config *config.Configuration
	logger *slog.Logger
	uc     uc.PublicWalletCountByFilterUseCase
}

func NewCountPublicWalletsByFilterService(
	config *config.Configuration,
	logger *slog.Logger,
	uc uc.PublicWalletCountByFilterUseCase,
) CountPublicWalletsByFilterService {
	return &countPublicWalletsByFilterServiceImpl{
		config: config,
		logger: logger,
		uc:     uc,
	}
}

func (s *countPublicWalletsByFilterServiceImpl) CountByFilter(ctx context.Context, filter *dom.PublicWalletFilter) (uint64, error) {
	s.logger.Debug("counting public wallets by filter",
		slog.Any("created_by_user_id", filter.CreatedByUserID))

	return s.uc.Execute(ctx, filter)
}
