// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/domain/ratelimiter/model.go
package ratelimiter

import (
	"time"
)

// AuthAttempt represents a record of authentication attempts from an IP address
type AuthAttempt struct {
	IPAddress    string    `json:"ip_address"`
	FailureCount int       `json:"failure_count"`
	LastFailure  time.Time `json:"last_failure"`
	IsBanned     bool      `json:"is_banned"`
	BannedUntil  time.Time `json:"banned_until"`
}
