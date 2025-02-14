// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/domainstate/interface.go
package oauthstate

import (
	"context"
)

// Repository defines the interface for OAuth state persistence operations
type Repository interface {
	Create(ctx context.Context, state *OAuthState) error
	GetByState(ctx context.Context, state string) (*OAuthState, error)
	Delete(ctx context.Context, state string) error
	DeleteExpired(ctx context.Context) error
}
