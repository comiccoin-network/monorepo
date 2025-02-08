// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/domain/oauthsession/interface.go
package oauthsession

import (
	"context"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Repository defines the interface for OAuth session persistence operations
type Repository interface {
	Create(ctx context.Context, session *OAuthSession) error
	GetBySessionID(ctx context.Context, sessionID string) (*OAuthSession, error)
	GetByUserID(ctx context.Context, userID primitive.ObjectID) (*OAuthSession, error)
	Update(ctx context.Context, session *OAuthSession) error
	Delete(ctx context.Context, sessionID string) error
	DeleteExpired(ctx context.Context) error
}
