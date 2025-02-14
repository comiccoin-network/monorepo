// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/domainstate/model.go
package oauthstate

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type OAuthState struct {
	ID        primitive.ObjectID `bson:"_id" json:"id"`
	State     string             `bson:"state" json:"state"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
	ExpiresAt time.Time          `bson:"expires_at" json:"expires_at"`
}
