package blocktx

import (
	"context"
	"fmt"
	"log/slog"
	"math/big"
	"strings"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	inmem "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/storage"
	"github.com/ethereum/go-ethereum/common"

	uc_blocktx "github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/usecase/blocktx"
)

type LocalNotificationCallback func(direction string, typeOf string, valueOrTokenID *big.Int, timestamp uint64)

type AccountLocalNotificationService interface {
	Execute(ctx context.Context, address *common.Address, callback LocalNotificationCallback) error
}

type accountLocalNotificationServiceImpl struct {
	logger                                                                                      *slog.Logger
	mem                                                                                         inmem.Storage
	subscribeToGetLatestBlockTransactionByAddressServerSentEventsFromBlockchainAuthorityUseCase uc_blocktx.SubscribeToGetLatestBlockTransactionByAddressServerSentEventsFromBlockchainAuthorityUseCase
}

func NewAccountLocalNotificationService(
	logger *slog.Logger,
	mem inmem.Storage,
	uc1 uc_blocktx.SubscribeToGetLatestBlockTransactionByAddressServerSentEventsFromBlockchainAuthorityUseCase,
) AccountLocalNotificationService {
	return &accountLocalNotificationServiceImpl{logger, mem, uc1}
}

func (s *accountLocalNotificationServiceImpl) Execute(ctx context.Context, address *common.Address, callback LocalNotificationCallback) error {
	// STEP 1: Input validation
	s.logger.Info("🔍 Starting local notification service...",
		slog.String("address", address.String()))

	e := make(map[string]string)
	if address == nil {
		e["address"] = "missing value"
	}
	if len(e) != 0 {
		s.logger.Warn("❌ Validation failed for getting account",
			slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	// STEP 2: Subscribe to blockchain events
	s.logger.Info("🔌 Connecting to blockchain events stream...",
		slog.String("address", address.String()))

	strCh, err := s.subscribeToGetLatestBlockTransactionByAddressServerSentEventsFromBlockchainAuthorityUseCase.Execute(ctx, address)
	if err != nil {
		s.logger.Error("💥 Failed to connect to blockchain events",
			slog.Any("error", err))
		return fmt.Errorf("failed to load sse use-case: %w", err)
	}

	s.logger.Info("✅ Successfully connected to blockchain events stream",
		slog.String("address", address.String()))

	// Create a channel to handle program termination
	done := make(chan struct{})

	go func() {
		defer close(done)
		s.logger.Info("👀 Starting notification monitoring...",
			slog.String("address", address.String()))

		for {
			select {
			case newContent, ok := <-strCh:
				if !ok {
					s.logger.Info("🚪 Channel closed, stopping notification listener",
						slog.String("address", address.String()))
					return
				}

				// Check our in-memory storage for recent content
				recentContentBytes, err := s.mem.Get(fmt.Sprintf("latest_blocktx_for_%v", address.String()))
				if err != nil {
					if strings.Contains(err.Error(), "does not exist for") {
						s.logger.Info("📝 First time seeing this address, initializing storage...",
							slog.String("address", address.String()))
						if err := s.mem.Set(fmt.Sprintf("latest_blocktx_for_%v", address.String()), []byte(newContent)); err != nil {
							s.logger.Error("💥 Error setting in-memory database",
								slog.Any("error", err))
							return
						}
					} else {
						s.logger.Error("💥 Error with getting from in-memory database",
							slog.Any("error", err))
						return
					}
				}
				recentContent := string(recentContentBytes)

				s.logger.Debug("📡 Received blockchain event",
					slog.Any("new_content", newContent),
					slog.Any("recent_content", recentContent),
					slog.String("address", address.String()))

				// Handle first notification
				if recentContent == "" {
					s.logger.Info("🎯 Received first notification, storing initial state...",
						slog.String("address", address.String()))
					if err := s.mem.Set(fmt.Sprintf("latest_blocktx_for_%v", address.String()), []byte(newContent)); err != nil {
						s.logger.Error("💥 Error setting initial state",
							slog.Any("error", err))
						return
					}
					continue
				}

				// Skip if content hasn't changed
				if newContent == recentContent {
					s.logger.Debug("⏳ No new changes, continuing monitoring...",
						slog.String("address", address.String()))
					continue
				}

				// Parse the notification content
				toks := strings.Split(newContent, "|")
				if len(toks) != 4 {
					s.logger.Error("⚠️ Invalid notification format",
						slog.Any("content", newContent),
						slog.String("address", address.String()))
					continue
				}

				direction := toks[0]
				typeOf := toks[1]
				valueOrTokenID, ok := new(big.Int).SetString(toks[2], 10)
				if !ok {
					s.logger.Error("⚠️ Failed to parse valueOrTokenID",
						slog.String("value", toks[2]),
						slog.String("address", address.String()))
					continue
				}
				timestampBig, ok := new(big.Int).SetString(toks[3], 10)
				if !ok {
					s.logger.Error("⚠️ Failed to parse timestamp",
						slog.String("value", toks[3]),
						slog.String("address", address.String()))
					continue
				}
				timestamp := timestampBig.Uint64()

				s.logger.Info("🔄 Processing new blockchain event",
					slog.String("direction", direction),
					slog.String("type", typeOf),
					slog.String("valueOrTokenID", valueOrTokenID.String()),
					slog.Uint64("timestamp", timestamp),
					slog.String("address", address.String()))

				// Update stored content
				if err := s.mem.Set(fmt.Sprintf("latest_blocktx_for_%v", address.String()), []byte(newContent)); err != nil {
					s.logger.Error("💥 Error updating stored content",
						slog.Any("error", err),
						slog.String("address", address.String()))
					return
				}

				s.logger.Debug("💾 Successfully updated stored content",
					slog.String("address", address.String()))

				// Execute the callback if provided
				if callback != nil {
					s.logger.Debug("📣 Executing notification callback...",
						slog.String("address", address.String()))
					callback(direction, typeOf, valueOrTokenID, timestamp)
				}

			case <-ctx.Done():
				s.logger.Info("🛑 Context cancelled, stopping notification listener",
					slog.String("address", address.String()))
				return
			}
		}
	}()

	// Wait for either goroutine completion or context cancellation
	select {
	case <-done:
		s.logger.Info("👋 Notification service completed normally",
			slog.String("address", address.String()))
		return nil
	case <-ctx.Done():
		s.logger.Info("🔚 Shutdown initiated, waiting for cleanup...",
			slog.String("address", address.String()))
		<-done // Wait for goroutine to finish cleanup
		s.logger.Info("✨ Cleanup completed, service shutting down",
			slog.String("address", address.String()))
		return ctx.Err()
	}
}
