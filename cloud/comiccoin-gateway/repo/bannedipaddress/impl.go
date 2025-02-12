package bannedipaddress

import (
	"context"
	"log"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/config"
	dom_banip "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/domain/bannedipaddress"
)

type bannedIPAddressImpl struct {
	Logger     *slog.Logger
	DbClient   *mongo.Client
	Collection *mongo.Collection
}

func NewRepository(appCfg *config.Configuration, loggerp *slog.Logger, client *mongo.Client) dom_banip.Repository {
	// ctx := context.Background()
	uc := client.Database(appCfg.DB.Name).Collection("banned_ip_addresses")

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
	// colleciton.
	_, err := uc.Indexes().CreateMany(context.TODO(), []mongo.IndexModel{
		{Keys: bson.D{{Key: "federatedidentity_id", Value: 1}}},
		{Keys: bson.D{
			{Key: "value", Value: "text"},
		}},
	})
	if err != nil {
		// It is important that we crash the app on startup to meet the
		// requirements of `google/wire` framework.
		log.Fatal(err)
	}

	s := &bannedIPAddressImpl{
		Logger:     loggerp,
		DbClient:   client,
		Collection: uc,
	}
	return s
}
