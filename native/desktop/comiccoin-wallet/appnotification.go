package main

import (
	"context"
	"log/slog"
	"math"
	"math/big"
	"strings"
	"time"

	"github.com/ethereum/go-ethereum/common"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// Define a notification type for type safety and better serialization
type TransactionNotification struct {
	Direction      string `json:"direction"`
	Type           string `json:"type"`
	ValueOrTokenID string `json:"valueOrTokenID"`
	Timestamp      uint64 `json:"timestamp"`
	Status         string `json:"status"`
}

func (a *App) startNotificationListener(ctx context.Context) {
	preferences := PreferencesInstance()
	addr := common.HexToAddress(strings.ToLower(preferences.DefaultWalletAddress))

	// Create a separate context for the notification service that we can cancel
	notifyCtx, cancel := context.WithCancel(ctx)
	defer cancel()

	// Create an error channel to handle service errors
	errChan := make(chan error, 1)

	go func() {
		err := a.localNotificationService.Execute(notifyCtx, &addr, func(direction string, typeOf string, valueOrTokenID *big.Int, timestamp uint64) {
			notification := TransactionNotification{
				Direction:      direction,
				Type:           typeOf,
				ValueOrTokenID: valueOrTokenID.String(),
				Timestamp:      timestamp,
				Status:         "new",
			}

			// Emit the event using Wails v2 runtime
			runtime.EventsEmit(a.ctx, "transaction:new", notification)

			// Log the notification for debugging
			a.logger.Debug("Emitted new transaction notification",
				slog.String("direction", direction),
				slog.String("type", typeOf),
				slog.String("value", valueOrTokenID.String()),
				slog.Uint64("timestamp", timestamp),
			)
		})
		errChan <- err
	}()

	// Handle errors and service lifecycle
	select {
	case <-ctx.Done():
		a.logger.Info("Notification service shutting down due to context cancellation")
		cancel()
	case err := <-errChan:
		if err != nil {
			a.logger.Error("Notification service error", slog.Any("error", err))
			// Emit error event to frontend
			runtime.EventsEmit(a.ctx, "transaction:error", map[string]string{
				"error": err.Error(),
			})

			// Implement reconnection logic
			go a.handleNotificationReconnect(ctx)
		}
	}
}

func (a *App) handleNotificationReconnect(ctx context.Context) {
	backoff := time.Second * 5
	maxBackoff := time.Minute * 5

	for {
		select {
		case <-ctx.Done():
			return
		case <-time.After(backoff):
			// Try to restart the notification service
			go a.startNotificationListener(ctx)

			// Increase backoff for next attempt
			backoff = time.Duration(math.Min(float64(backoff)*2, float64(maxBackoff)))
		}
	}
}
