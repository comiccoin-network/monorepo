// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/repo/token/impl.go
package token

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/config"
	dom_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/token"
)

type tokenStorerImpl struct {
	Logger     *slog.Logger
	DbClient   *mongo.Client
	Collection *mongo.Collection
}

func NewRepository(appCfg *config.Configuration, loggerp *slog.Logger, client *mongo.Client) dom_token.Repository {
	// Initialize the tokens collection
	tc := client.Database(appCfg.DB.Name).Collection("oauth_tokens")

	// Create indexes for optimizing queries and enforcing constraints
	_, err := tc.Indexes().CreateMany(context.TODO(), []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "federatedidentity_id", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
		{
			Keys:    bson.D{{Key: "expires_at", Value: 1}},
			Options: options.Index().SetExpireAfterSeconds(0),
		},
		{
			Keys: bson.D{
				{Key: "access_token", Value: 1},
				{Key: "refresh_token", Value: 1},
			},
			Options: options.Index().SetUnique(true),
		},
	})
	if err != nil {
		loggerp.Error("failed to create indexes",
			slog.Any("error", err))
		// Fatal error on startup if indexes cannot be created
		panic(err)
	}

	return &tokenStorerImpl{
		Logger:     loggerp,
		DbClient:   client,
		Collection: tc,
	}
}
