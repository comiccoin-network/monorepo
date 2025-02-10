// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/domain/token/model.go
package token

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Token represents an OAuth 2.0 token (access or refresh)
type Token struct {
	ID           primitive.ObjectID `bson:"_id" json:"id"`
	UserID       primitive.ObjectID `bson:"user_id" json:"user_id"`
	AccessToken  string             `bson:"access_token" json:"access_token"`
	RefreshToken string             `bson:"refresh_token" json:"refresh_token"`
	ExpiresAt    time.Time          `bson:"expires_at" json:"expires_at"`
}
