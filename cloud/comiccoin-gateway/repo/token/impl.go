// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/repo/token/impl.go
package token

import (
	"context"
	"log"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/config"
	dom_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/domain/token"
)

type tokenStorerImpl struct {
	Logger     *slog.Logger
	DbClient   *mongo.Client
	Collection *mongo.Collection
}

func NewRepository(appCfg *config.Configuration, loggerp *slog.Logger, client *mongo.Client) dom_token.Repository {
	// Initialize the tokens collection
	tc := client.Database(appCfg.DB.Name).Collection("tokens")

	// Create indexes for optimizing queries and enforcing constraints
	_, err := tc.Indexes().CreateMany(context.TODO(), []mongo.IndexModel{
		// Unique index on token_id for fast lookups and uniqueness
		{
			Keys:    bson.D{{Key: "token_id", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
		// Compound index for user tokens with type
		{
			Keys: bson.D{
				{Key: "user_id", Value: 1},
				{Key: "token_type", Value: 1},
				{Key: "is_revoked", Value: 1},
			},
		},
		// Index for cleanup of expired tokens
		{
			Keys: bson.D{
				{Key: "expires_at", Value: 1},
				{Key: "is_revoked", Value: 1},
			},
		},
		// TTL index for automatic removal of expired tokens
		{
			Keys:    bson.D{{Key: "expires_at", Value: 1}},
			Options: options.Index().SetExpireAfterSeconds(0),
		},
		// Index for application-specific queries
		{
			Keys: bson.D{
				{Key: "app_id", Value: 1},
				{Key: "token_type", Value: 1},
			},
		},
	})
	if err != nil {
		// Fatal error on startup if indexes cannot be created
		log.Fatal(err)
	}

	return &tokenStorerImpl{
		Logger:     loggerp,
		DbClient:   client,
		Collection: tc,
	}
}
