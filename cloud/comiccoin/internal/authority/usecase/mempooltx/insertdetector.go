package mempooltx

import (
	"context"
	"errors"
	"fmt"
	"log"
	"log/slog"
	"time"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/domain"
)

// ErrChannelClosed is a sentinel error for when the change stream channel is closed
var ErrChannelClosed = errors.New("change stream channel closed")

type MempoolTransactionInsertionDetectorUseCase interface {
	Execute(ctx context.Context) (*domain.MempoolTransaction, error)
	Terminate()
}

type mempoolTransactionInsertionDetectorUseCaseImpl struct {
	config   *config.Configuration
	logger   *slog.Logger
	repo     domain.MempoolTransactionRepository
	dataChan <-chan domain.MempoolTransaction
	quitChan chan struct{}
}

func NewMempoolTransactionInsertionDetectorUseCase(config *config.Configuration, logger *slog.Logger, repo domain.MempoolTransactionRepository) MempoolTransactionInsertionDetectorUseCase {
	useCase := &mempoolTransactionInsertionDetectorUseCaseImpl{
		config:   config,
		logger:   logger,
		repo:     repo,
		quitChan: make(chan struct{}),
	}

	// Initialize the change stream with retry mechanism
	if err := useCase.initializeChangeStream(context.Background()); err != nil {
		log.Fatalf("NewMempoolTransactionInsertionDetectorUseCase: Failed initializing use-case: %v\n", err)
	}

	return useCase
}

func (uc *mempoolTransactionInsertionDetectorUseCaseImpl) initializeChangeStream(ctx context.Context) error {
	var err error
	uc.dataChan, uc.quitChan, err = uc.repo.GetInsertionChangeStreamChannel(ctx)
	return err
}

func (uc *mempoolTransactionInsertionDetectorUseCaseImpl) reconnectChangeStream(ctx context.Context) error {
	uc.logger.Info("Attempting to reconnect change stream...")

	// Implement exponential backoff for retries
	backoff := time.Second
	maxBackoff := time.Minute
	maxAttempts := 5

	for attempt := 1; attempt <= maxAttempts; attempt++ {
		err := uc.initializeChangeStream(ctx)
		if err == nil {
			uc.logger.Info("Successfully reconnected change stream")
			return nil
		}

		uc.logger.Warn("Failed to reconnect change stream",
			slog.Int("attempt", attempt),
			slog.Duration("backoff", backoff),
			slog.Any("error", err))

		// Check if context is cancelled before sleeping
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-time.After(backoff):
		}

		// Exponential backoff with maximum limit
		backoff *= 2
		if backoff > maxBackoff {
			backoff = maxBackoff
		}
	}

	return errors.New("failed to reconnect after maximum attempts")
}

func (uc *mempoolTransactionInsertionDetectorUseCaseImpl) Execute(ctx context.Context) (*domain.MempoolTransaction, error) {
	for {
		select {
		case mempoolTx, ok := <-uc.dataChan:
			if !ok {
				uc.logger.Warn("Change stream channel closed unexpectedly")

				// Attempt to reconnect
				if err := uc.reconnectChangeStream(ctx); err != nil {
					return nil, fmt.Errorf("failed to recover from closed channel: %w", err)
				}
				continue // Retry after reconnection
			}

			// Validate the transaction
			if err := mempoolTx.Validate(uc.config.Blockchain.ChainID, true); err != nil {
				uc.logger.Warn("Validation failed for transaction",
					slog.Any("error", err),
					slog.Any("Transaction", mempoolTx.Transaction),
					slog.Any("tx_sig_v", mempoolTx.VBytes),
					slog.Any("tx_sig_r", mempoolTx.RBytes),
					slog.Any("tx_sig_s", mempoolTx.SBytes))
				return nil, err
			}

			return &mempoolTx, nil

		case <-ctx.Done():
			return nil, ctx.Err()
		}
	}
}

func (uc *mempoolTransactionInsertionDetectorUseCaseImpl) Terminate() {
	uc.logger.Debug("Closing change stream connection...")
	close(uc.quitChan)
}
