package faucet

import (
	"context"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config/constants"
	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/domain/faucet"
)

func (impl faucetImpl) Create(ctx context.Context, u *dom.Faucet) error {
	// DEVELOPER NOTES:
	// According to mongodb documentaiton:
	//     Non-existent Databases and Collections
	//     If the necessary database and collection don't exist when you perform a write operation, the server implicitly creates them.
	//     Source: https://www.mongodb.com/docs/drivers/go/current/usage-examples/insertOne/

	if u.ID == primitive.NilObjectID {
		u.ID = primitive.NewObjectID()
		impl.Logger.Warn("database insert user as not included id value, created id now.", slog.Any("id", u.ID))
	}

	_, err := impl.Collection.InsertOne(ctx, u)

	// check for errors in the insertion
	if err != nil {
		impl.Logger.Error("database failed create error",
			slog.Any("error", err))
		return err
	}

	return nil
}

func (impl faucetImpl) CreateFaucetForMainNetBlockchain(ctx context.Context) error {
	faucet := &dom.Faucet{
		ID:                         primitive.NewObjectID(),
		ChainID:                    constants.ChainIDMainNet,
		Balance:                    0,
		UsersCount:                 0,
		TotalCoinsDistributed:      0,
		TotalTransactions:          0,
		DistributationRatePerDay:   0,
		TotalCoinsDistributedToday: 0,
		TotalTransactionsToday:     0,
		CreatedAt:                  time.Now(),
		LastModifiedAt:             time.Now(),
	}
	return impl.Create(ctx, faucet)
}
