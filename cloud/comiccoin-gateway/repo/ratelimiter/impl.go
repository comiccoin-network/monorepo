// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/repo/ratelimit/ratelimiter/impl.go
package ratelimiter

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"time"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/storage/database/mongodbcache"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/config"
	dom_ratelimit "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/domain/ratelimiter"
)

const (
	maxFailedAttempts = 3               // Maximum number of failed attempts before temporary ban
	banDuration       = 24 * time.Hour  // Duration of temporary ban
	failureWindow     = 1 * time.Hour   // Time window for counting failed attempts
	cacheKeyPrefix    = "auth_attempt_" // Prefix for cache keys
)

type rateLimiterImpl struct {
	cfg    *config.Configuration
	logger *slog.Logger
	cache  mongodbcache.Cacher
}

// NewRateLimiter creates a new instance of the rate limiter
func NewRateLimiter(cfg *config.Configuration, logger *slog.Logger, cache mongodbcache.Cacher) dom_ratelimit.RateLimiter {
	return &rateLimiterImpl{
		cfg:    cfg,
		logger: logger,
		cache:  cache,
	}
}

// getCacheKey generates a consistent cache key for storing auth attempts
func getCacheKey(ipAddress string) string {
	return fmt.Sprintf("%s%s", cacheKeyPrefix, ipAddress)
}

// RecordFailure implements RateLimiter.RecordFailure
func (r *rateLimiterImpl) RecordFailure(ctx context.Context, ipAddress string) error {
	key := getCacheKey(ipAddress)
	now := time.Now()

	// Get existing attempt record
	var attempt dom_ratelimit.AuthAttempt
	data, err := r.cache.Get(ctx, key)
	if err == nil {
		if err := json.Unmarshal(data, &attempt); err != nil {
			r.logger.Error("failed to unmarshal auth attempt data",
				slog.String("ip_address", ipAddress),
				slog.Any("error", err))
			return err
		}
	}

	// Reset count if outside failure window
	if attempt.LastFailure.Add(failureWindow).Before(now) {
		attempt = dom_ratelimit.AuthAttempt{
			IPAddress: ipAddress,
		}
	}

	// Update attempt record
	attempt.FailureCount++
	attempt.LastFailure = now

	// Apply temporary ban if threshold exceeded
	if attempt.FailureCount >= maxFailedAttempts {
		attempt.IsBanned = true
		attempt.BannedUntil = now.Add(banDuration)
		r.logger.Warn("temporary ban applied due to excessive failed attempts",
			slog.String("ip_address", ipAddress),
			slog.Time("banned_until", attempt.BannedUntil))
	}

	// Store updated attempt data
	data, err = json.Marshal(attempt)
	if err != nil {
		return err
	}

	// Use longer expiry for banned IPs
	expiry := failureWindow
	if attempt.IsBanned {
		expiry = banDuration
	}

	return r.cache.SetWithExpiry(ctx, key, data, expiry)
}

// IsAllowed implements RateLimiter.IsAllowed
func (r *rateLimiterImpl) IsAllowed(ctx context.Context, ipAddress string) (bool, error) {
	key := getCacheKey(ipAddress)

	data, err := r.cache.Get(ctx, key)
	if err != nil {
		// No record means IP is allowed
		return true, nil
	}

	var attempt dom_ratelimit.AuthAttempt
	if err := json.Unmarshal(data, &attempt); err != nil {
		r.logger.Error("failed to unmarshal auth attempt data",
			slog.String("ip_address", ipAddress),
			slog.Any("error", err))
		return false, err
	}

	// Remove expired bans
	if attempt.IsBanned && time.Now().After(attempt.BannedUntil) {
		if err := r.cache.Delete(ctx, key); err != nil {
			r.logger.Error("failed to remove expired ban",
				slog.String("ip_address", ipAddress),
				slog.Any("error", err))
		}
		return true, nil
	}

	return !attempt.IsBanned, nil
}

// Reset implements RateLimiter.Reset
func (r *rateLimiterImpl) Reset(ctx context.Context, ipAddress string) error {
	return r.cache.Delete(ctx, getCacheKey(ipAddress))
}
