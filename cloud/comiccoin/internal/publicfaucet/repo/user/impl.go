// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/repo/user/impl.go
package user

import (
	"context"
	"log"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	dom_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/domain/user"
)

type userStorerImpl struct {
	Logger     *slog.Logger
	DbClient   *mongo.Client
	Collection *mongo.Collection
}

func NewRepository(appCfg *config.Configuration, loggerp *slog.Logger, client *mongo.Client) dom_user.Repository {
	// ctx := context.Background()
	uc := client.Database(appCfg.DB.PublicFaucetName).Collection("users")

	// // For debugging purposes only or if you are going to recreate new indexes.
	// if _, err := uc.Indexes().DropAll(context.TODO()); err != nil {
	// 	loggerp.Warn("failed deleting all indexes",
	// 		slog.Any("err", err))
	//
	// 	// Do not crash app, just continue.
	// }

	// Note:
	// * 1 for ascending
	// * -1 for descending
	// * "text" for text indexes

	// The following few lines of code will create the index for our app for this
	// collection.
	_, err := uc.Indexes().CreateMany(context.TODO(), []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "federatedidentity_id", Value: -1}},
			Options: options.Index().SetUnique(true),
		},
		{Keys: bson.D{
			{Key: "created_at", Value: -1},
		}},
		{Keys: bson.D{
			{Key: "status", Value: 1},
			{Key: "created_at", Value: -1},
		}},
		{Keys: bson.D{
			{Key: "name", Value: "text"},
			{Key: "lexical_name", Value: "text"},
			{Key: "email", Value: "text"},
			{Key: "phone", Value: "text"},
			{Key: "country", Value: "text"},
			{Key: "region", Value: "text"},
			{Key: "city", Value: "text"},
			{Key: "postal_code", Value: "text"},
			{Key: "address_line1", Value: "text"},
		}},
	})
	if err != nil {
		// It is important that we crash the app on startup to meet the
		// requirements of `google/wire` framework.
		log.Fatal(err)
	}
	s := &userStorerImpl{
		Logger:     loggerp,
		DbClient:   client,
		Collection: uc,
	}
	return s
}
