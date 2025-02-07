// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/domain/token/model.go
package token

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Token represents an OAuth 2.0 token (access or refresh)
type Token struct {
	ID         primitive.ObjectID `bson:"_id,omitempty"`
	TokenID    string             `bson:"token_id"`     // The hashed token value
	TokenType  string             `bson:"token_type"`   // "access" or "refresh"
	UserID     string             `bson:"user_id"`      // Associated user
	AppID      string             `bson:"app_id"`       // Associated application
	Scope      string             `bson:"scope"`        // Granted permissions
	ExpiresAt  time.Time          `bson:"expires_at"`   // When token expires
	IssuedAt   time.Time          `bson:"issued_at"`    // When token was issued
	IsRevoked  bool               `bson:"is_revoked"`   // Whether token was revoked
	LastUsedAt time.Time          `bson:"last_used_at"` // Track token usage
}
