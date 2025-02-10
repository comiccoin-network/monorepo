// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/token/interface.go
package token

import (
	"context"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Repository defines the interface for token persistence operations
type Repository interface {
	UpsertByUserID(ctx context.Context, token *Token) error
	GetByUserID(ctx context.Context, userID primitive.ObjectID) (*Token, error)
	DeleteExpiredTokens(ctx context.Context) error
}
