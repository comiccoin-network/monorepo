// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/repo/federatedidentity/impl.go
package federatedidentity

import (
	"context"
	"log"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/config"
	dom_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/domain/federatedidentity"
)

type federatedidentityStorerImpl struct {
	Logger     *slog.Logger
	DbClient   *mongo.Client
	Collection *mongo.Collection
}

func NewRepository(appCfg *config.Configuration, loggerp *slog.Logger, client *mongo.Client) dom_federatedidentity.Repository {
	// ctx := context.Background()
	uc := client.Database(appCfg.DB.Name).Collection("federated_identities")

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
	s := &federatedidentityStorerImpl{
		Logger:     loggerp,
		DbClient:   client,
		Collection: uc,
	}
	return s
}
