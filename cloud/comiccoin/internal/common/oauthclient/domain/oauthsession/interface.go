// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/domainsession/interface.go
package oauthsession

import (
	"context"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Repository defines the interface for OAuth session persistence operations
type Repository interface {
	Create(ctx context.Context, session *OAuthSession) error
	GetBySessionID(ctx context.Context, sessionID string) (*OAuthSession, error)
	GetByFederatedIdentityID(ctx context.Context, federatedidentityID primitive.ObjectID) (*OAuthSession, error)
	Update(ctx context.Context, session *OAuthSession) error
	Delete(ctx context.Context, sessionID string) error
	DeleteExpired(ctx context.Context) error
}
