// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/service/oauth/cleanup.go
package oauth

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/usecase/token"
)

// TokenCleanupService handles periodic cleanup of expired tokens
type TokenCleanupService struct {
	config *config.Configuration
	logger *slog.Logger

	// Use case for deleting expired tokens
	deleteExpiredTokensUseCase token.TokenDeleteExpiredUseCase

	// Channels for controlling the cleanup routine
	stopChan chan struct{}
	doneChan chan struct{}
}

// NewTokenCleanupService creates a new instance of TokenCleanupService
func NewTokenCleanupService(
	config *config.Configuration,
	logger *slog.Logger,
	deleteExpiredTokensUseCase token.TokenDeleteExpiredUseCase,
) *TokenCleanupService {
	return &TokenCleanupService{
		config:                     config,
		logger:                     logger,
		deleteExpiredTokensUseCase: deleteExpiredTokensUseCase,
		stopChan:                   make(chan struct{}),
		doneChan:                   make(chan struct{}),
	}
}

// Start begins the periodic token cleanup process
func (s *TokenCleanupService) Start() {
	// Start a goroutine for periodic cleanup
	go func() {
		// Ensure we signal completion when the goroutine exits
		defer close(s.doneChan)

		// Create a ticker that fires every hour
		ticker := time.NewTicker(1 * time.Hour)
		defer ticker.Stop()

		// Run an initial cleanup when the service starts
		if err := s.cleanup(context.Background()); err != nil {
			s.logger.Error("initial token cleanup failed",
				slog.Any("error", err))
		}

		// Main cleanup loop
		for {
			select {
			case <-ticker.C:
				// Perform cleanup when the ticker fires
				if err := s.cleanup(context.Background()); err != nil {
					s.logger.Error("scheduled token cleanup failed",
						slog.Any("error", err))
				}
			case <-s.stopChan:
				// Exit when stop signal is received
				return
			}
		}
	}()
}

// cleanup performs the actual token cleanup operation
func (s *TokenCleanupService) cleanup(ctx context.Context) error {
	// We now use the DeleteExpiredTokensUseCase which encapsulates the cleanup logic
	if err := s.deleteExpiredTokensUseCase.Execute(ctx); err != nil {
		return fmt.Errorf("executing token cleanup: %w", err)
	}

	s.logger.Info("completed token cleanup operation")
	return nil
}

// Stop gracefully stops the cleanup service
func (s *TokenCleanupService) Stop() {
	// Signal the cleanup routine to stop
	close(s.stopChan)
	// Wait for cleanup routine to finish
	<-s.doneChan
}
