// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/domain/authorization/model.go
package authorization

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// AuthorizationCode represents an OAuth 2.0 authorization code
type AuthorizationCode struct {
	ID            primitive.ObjectID `bson:"_id,omitempty"`
	Code          string             `bson:"code"`           // Hashed authorization code
	AppID         string             `bson:"app_id"`         // Associated application
	FederatedIdentityID        string             `bson:"federatedidentity_id"`        // Associated federatedidentity
	RedirectURI   string             `bson:"redirect_uri"`   // Callback URL
	Scope         string             `bson:"scope"`          // Requested permissions
	CodeChallenge string             `bson:"code_challenge"` // PKCE support
	ExpiresAt     time.Time          `bson:"expires_at"`     // Short expiration (10 mins)
	IsUsed        bool               `bson:"is_used"`        // Whether code was exchanged
	CreatedAt     time.Time          `bson:"created_at"`     // When code was issued
}
