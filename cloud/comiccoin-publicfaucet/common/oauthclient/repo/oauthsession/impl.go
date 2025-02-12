// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/repo/oauthsession/impl.go
package oauthsession

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/config"
	dom_oauthsession "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/oauthsession"
)

type oauthSessionStorerImpl struct {
	Logger     *slog.Logger
	DbClient   *mongo.Client
	Collection *mongo.Collection
}

func NewRepository(appCfg *config.Configuration, loggerp *slog.Logger, client *mongo.Client) dom_oauthsession.Repository {
	// Initialize the oauth_sessions collection
	sc := client.Database(appCfg.DB.Name).Collection("oauth_sessions")

	// For debugging purposes only or if you are going to recreate new indexes.
	if _, err := sc.Indexes().DropAll(context.TODO()); err != nil {
		loggerp.Warn("failed deleting all indexes",
			slog.Any("err", err))

		// Do not crash app, just continue.
	}

	// Create indexes for optimizing queries and enforcing constraints
	_, err := sc.Indexes().CreateMany(context.TODO(), []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "session_id", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
		{
			Keys: bson.D{{Key: "federatedidentity_id", Value: 1}},
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

	return &oauthSessionStorerImpl{
		Logger:     loggerp,
		DbClient:   client,
		Collection: sc,
	}
}
