// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/domainsession/model.go
package oauthsession

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type OAuthSession struct {
	ID          primitive.ObjectID `bson:"_id" json:"id"`
	SessionID   string             `bson:"session_id" json:"session_id"`
	FederatedIdentityID      primitive.ObjectID `bson:"federatedidentity_id" json:"federatedidentity_id"`
	AccessToken string             `bson:"access_token" json:"access_token"`
	CreatedAt   time.Time          `bson:"created_at" json:"created_at"`
	ExpiresAt   time.Time          `bson:"expires_at" json:"expires_at"`
	LastUsedAt  time.Time          `bson:"last_used_at" json:"last_used_at"`
}
