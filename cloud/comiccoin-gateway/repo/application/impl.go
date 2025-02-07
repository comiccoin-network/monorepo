// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/repo/application/impl.go
package application

import (
	"context"
	"log"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/config"
	dom_app "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/domain/application"
)

type applicationStorerImpl struct {
	Logger     *slog.Logger
	DbClient   *mongo.Client
	Collection *mongo.Collection
}

func NewRepository(appCfg *config.Configuration, loggerp *slog.Logger, client *mongo.Client) dom_app.Repository {
	// Initialize the applications collection
	ac := client.Database(appCfg.DB.Name).Collection("applications")

	// Create indexes for optimizing queries we'll frequently run
	_, err := ac.Indexes().CreateMany(context.TODO(), []mongo.IndexModel{
		{Keys: bson.D{
			{Key: "app_id", Value: 1},
		}},
		{Keys: bson.D{
			{Key: "active", Value: 1},
			{Key: "created_at", Value: -1},
		}},
		{Keys: bson.D{
			{Key: "scopes", Value: 1},
			{Key: "active", Value: 1},
		}},
		{Keys: bson.D{
			{Key: "name", Value: "text"},
			{Key: "description", Value: "text"},
			{Key: "contact_email", Value: "text"},
		}},
	})
	if err != nil {
		// Fatal error on startup if indexes cannot be created
		log.Fatal(err)
	}

	return &applicationStorerImpl{
		Logger:     loggerp,
		DbClient:   client,
		Collection: ac,
	}
}
