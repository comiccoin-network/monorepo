package faucet

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson"

	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/domain/faucet"
)

func (impl faucetImpl) UpdateByChainID(ctx context.Context, m *dom.Faucet) error {
	filter := bson.M{"chain_id": m.ChainID}

	update := bson.M{ // DEVELOPERS NOTE: https://stackoverflow.com/a/60946010
		"$set": m,
	}

	// execute the UpdateOne() function to update the first matching document
	_, err := impl.Collection.UpdateOne(ctx, filter, update)
	if err != nil {
		impl.Logger.Error("database update user by chain id error", slog.Any("error", err))
		return err
	}

	// // display the number of documents updated
	// impl.Logger.Debug("number of documents updated", slog.Int64("modified_count", result.ModifiedCount))

	return nil
}
