// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/domain/ratelimiter/interface.go
package ratelimiter

import (
	"context"
)

// RateLimiter defines the interface for rate limiting authentication attempts
type RateLimiter interface {
	// RecordFailure records a failed authentication attempt for an IP address
	RecordFailure(ctx context.Context, ipAddress string) error

	// IsAllowed checks if an IP address is allowed to make authentication attempts
	IsAllowed(ctx context.Context, ipAddress string) (bool, error)

	// Reset clears the failure count for an IP address after successful authentication
	Reset(ctx context.Context, ipAddress string) error
}
