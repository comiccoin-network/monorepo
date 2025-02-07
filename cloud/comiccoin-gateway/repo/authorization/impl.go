// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/repo/authorization/impl.go
package authorization

import (
	"context"
	"log"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/config"
	dom_auth "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/domain/authorization"
)

type authorizationStorerImpl struct {
	Logger     *slog.Logger
	DbClient   *mongo.Client
	Collection *mongo.Collection
}

func NewRepository(appCfg *config.Configuration, loggerp *slog.Logger, client *mongo.Client) dom_auth.Repository {
	// Initialize the authorization_codes collection
	ac := client.Database(appCfg.DB.Name).Collection("authorization_codes")

	// Create indexes for optimizing queries and enforcing constraints
	_, err := ac.Indexes().CreateMany(context.TODO(), []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "code", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
		{
			Keys: bson.D{
				{Key: "expires_at", Value: 1},
				{Key: "is_used", Value: 1},
			},
		},
		{
			Keys: bson.D{
				{Key: "app_id", Value: 1},
				{Key: "user_id", Value: 1},
			},
		},
		// TTL index to automatically remove expired codes
		{
			Keys:    bson.D{{Key: "expires_at", Value: 1}},
			Options: options.Index().SetExpireAfterSeconds(0),
		},
	})
	if err != nil {
		// Fatal error on startup if indexes cannot be created
		log.Fatal(err)
	}

	return &authorizationStorerImpl{
		Logger:     loggerp,
		DbClient:   client,
		Collection: ac,
	}
}
