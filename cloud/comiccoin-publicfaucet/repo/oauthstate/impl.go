// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/repo/oauthstate/impl.go
package oauthstate

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/config"
	dom_oauthstate "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/domain/oauthstate"
)

type oauthStateStorerImpl struct {
	Logger     *slog.Logger
	DbClient   *mongo.Client
	Collection *mongo.Collection
}

func NewRepository(appCfg *config.Configuration, loggerp *slog.Logger, client *mongo.Client) dom_oauthstate.Repository {
	// Initialize the oauth_states collection
	sc := client.Database(appCfg.DB.Name).Collection("oauth_states")

	// Create indexes for optimizing queries and enforcing constraints
	_, err := sc.Indexes().CreateMany(context.TODO(), []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "state", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
		{
			Keys:    bson.D{{Key: "expires_at", Value: 1}},
			Options: options.Index().SetExpireAfterSeconds(0),
		},
	})
	if err != nil {
		loggerp.Error("failed to create indexes",
			slog.Any("error", err))
		panic(err)
	}

	return &oauthStateStorerImpl{
		Logger:     loggerp,
		DbClient:   client,
		Collection: sc,
	}
}
