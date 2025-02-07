// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/domain/authorization/interface.go
package authorization

import "context"

// Repository defines the interface for authorization code persistence operations
type Repository interface {
	// StoreCode creates a new authorization code
	StoreCode(ctx context.Context, code *AuthorizationCode) error

	// FindByCode retrieves an authorization code
	FindByCode(ctx context.Context, code string) (*AuthorizationCode, error)

	// MarkCodeAsUsed marks a code as used after token exchange
	MarkCodeAsUsed(ctx context.Context, code string) error

	// DeleteExpiredCodes removes expired authorization codes
	DeleteExpiredCodes(ctx context.Context) error
}
