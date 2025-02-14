// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/domain/token/errors.go
package token

import "errors"

// Define common token-related errors. These errors represent the core business rules
// about what can go wrong with tokens in our system.
var (
	ErrTokenNotFound = errors.New("token not found")
	ErrTokenExpired  = errors.New("token has expired")
	ErrTokenRevoked  = errors.New("token has been revoked")
)
