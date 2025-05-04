package blocktx

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/domain"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
)

// ListLatestBlockTransactionsUseCase defines the interface for retrieving the most recent
// blockchain transactions, limited by a specified count, regardless of ownership.
type ListLatestBlockTransactionsUseCase interface {
	// Execute retrieves the specified number of most recent transactions
	Execute(ctx context.Context, limit int64) ([]*domain.BlockTransaction, error)
}

// listLatestBlockTransactionsUseCaseImpl implements the ListLatestBlockTransactionsUseCase interface
type listLatestBlockTransactionsUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   domain.BlockDataRepository
}

// NewListLatestBlockTransactionsUseCase creates a new instance of ListLatestBlockTransactionsUseCase
func NewListLatestBlockTransactionsUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo domain.BlockDataRepository,
) ListLatestBlockTransactionsUseCase {
	return &listLatestBlockTransactionsUseCaseImpl{config, logger, repo}
}

// Execute retrieves the most recent transactions, limited by the specified count
func (uc *listLatestBlockTransactionsUseCaseImpl) Execute(ctx context.Context, limit int64) ([]*domain.BlockTransaction, error) {
	// Validate input
	if limit <= 0 {
		limit = 25 // Default limit if not specified or invalid
	}

	uc.logger.Debug("Starting to fetch latest transactions", slog.Int64("limit", limit))

	// Handle absurdly large limits to prevent abuse
	if limit > 1000 {
		e := make(map[string]string)
		e["limit"] = "limit too large, maximum is 1000"
		return nil, httperror.NewForBadRequest(&e)
	}

	// Use the dedicated repository method for fetching latest transactions
	transactions, err := uc.repo.ListLatestBlockTransactions(ctx, limit)
	if err != nil {
		uc.logger.Error("Failed to retrieve latest transactions",
			slog.Any("error", err))
		return nil, err
	}

	uc.logger.Debug("Successfully retrieved latest transactions",
		slog.Int("transaction_count", len(transactions)))

	// The transactions are already sorted and limited by the repository method,
	// and string representations should also be set by the repository
	return transactions, nil
}
