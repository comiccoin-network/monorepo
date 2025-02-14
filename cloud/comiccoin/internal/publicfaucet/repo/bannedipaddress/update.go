package bannedipaddress

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson"

	dom_banip "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/domain/bannedipaddress"
)

func (impl bannedIPAddressImpl) UpdateByID(ctx context.Context, m *dom_banip.BannedIPAddress) error {
	filter := bson.M{"_id": m.ID}

	update := bson.M{ // DEVELOPERS NOTE: https://stackoverflow.com/a/60946010
		"$set": m,
	}

	// execute the UpdateOne() function to update the first matching document
	_, err := impl.Collection.UpdateOne(ctx, filter, update)
	if err != nil {
		impl.Logger.Error("database update user transaction by id error", slog.Any("error", err))
		return err
	}

	// // display the number of documents updated
	// impl.Logger.Debug("number of documents updated", slog.Int64("modified_count", result.ModifiedCount))

	return nil
}
