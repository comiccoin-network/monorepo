// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/domain/token/interface.go
package token

import (
	"context"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Repository defines the interface for token persistence operations
type Repository interface {
	UpsertByFederatedIdentityID(ctx context.Context, token *Token) error
	GetByFederatedIdentityID(ctx context.Context, federatedidentityID primitive.ObjectID) (*Token, error)
	DeleteExpiredTokens(ctx context.Context) error
}
