package blocktx

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/domain"
	uc_blocktx "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/blocktx"
)

// ListLatestBlockTransactionsService defines the interface for retrieving latest transactions
type ListLatestBlockTransactionsService interface {
	Execute(ctx context.Context, limit int64) ([]*domain.BlockTransaction, error)
}

// listLatestBlockTransactionsServiceImpl implements the ListLatestBlockTransactionsService interface
type listLatestBlockTransactionsServiceImpl struct {
	config  *config.Configuration
	logger  *slog.Logger
	useCase uc_blocktx.ListLatestBlockTransactionsUseCase
}

// NewListLatestBlockTransactionsService creates a new instance of ListLatestBlockTransactionsService
func NewListLatestBlockTransactionsService(
	config *config.Configuration,
	logger *slog.Logger,
	useCase uc_blocktx.ListLatestBlockTransactionsUseCase,
) ListLatestBlockTransactionsService {
	return &listLatestBlockTransactionsServiceImpl{config, logger, useCase}
}

// Execute calls the underlying use case to retrieve the latest transactions
func (s *listLatestBlockTransactionsServiceImpl) Execute(ctx context.Context, limit int64) ([]*domain.BlockTransaction, error) {
	s.logger.Debug("Getting latest block transactions", slog.Int64("limit", limit))
	return s.useCase.Execute(ctx, limit)
}
