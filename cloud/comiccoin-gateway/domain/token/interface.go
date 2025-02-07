// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/domain/token/interface.go
package token

import "context"

// Repository defines the interface for token persistence operations
type Repository interface {
	// StoreToken creates a new token
	StoreToken(ctx context.Context, token *Token) error

	// FindByTokenID retrieves a token by its ID
	FindByTokenID(ctx context.Context, tokenID string) (*Token, error)

	// RevokeToken marks a token as revoked
	RevokeToken(ctx context.Context, tokenID string) error

	// RevokeAllUserTokens revokes all tokens for a user
	RevokeAllUserTokens(ctx context.Context, userID string) error

	// DeleteExpiredTokens removes expired tokens
	DeleteExpiredTokens(ctx context.Context) error
}
