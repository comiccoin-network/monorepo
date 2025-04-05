package publicwallet

import (
	"context"
	"log"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/publicwallet"
)

type publicWalletImpl struct {
	Logger     *slog.Logger
	DbClient   *mongo.Client
	Collection *mongo.Collection
}

func NewRepository(appCfg *config.Configuration, loggerp *slog.Logger, client *mongo.Client) dom.Repository {
	// ctx := context.Background()
	uc := client.Database(appCfg.DB.IAMName).Collection("public_wallets")

	// For debugging purposes only or if you are going to recreate new indexes.
	if _, err := uc.Indexes().DropAll(context.TODO()); err != nil {
		loggerp.Warn("failed deleting all indexes",
			slog.Any("err", err))
		// Do not crash app, just continue.
	}

	// Note:
	// * 1 for ascending
	// * -1 for descending
	// * "text" for text indexes

	// The following few lines of code will create the index for our app for this
	// colleciton.
	_, err := uc.Indexes().CreateMany(context.TODO(), []mongo.IndexModel{
		{Keys: bson.D{{Key: "user_id", Value: 1}}},
		{
			Keys:    bson.D{{Key: "address", Value: -1}},
			Options: options.Index().SetUnique(true),
		},
		// Individual field indexes for efficient regex searches
		{Keys: bson.D{{Key: "name", Value: 1}}},
		{Keys: bson.D{{Key: "description", Value: 1}}},
		// To improve performance of queries
		{Keys: bson.D{{Key: "is_verified", Value: -1}}},
		{Keys: bson.D{{Key: "type", Value: -1}}},
	})

	if err != nil {
		// It is important that we crash the app on startup to meet the
		// requirements of `google/wire` framework.
		log.Fatalf("failed creating indexes inside `public_wallets` collection: %v", err)
	}

	s := &publicWalletImpl{
		Logger:     loggerp,
		DbClient:   client,
		Collection: uc,
	}
	return s
}
