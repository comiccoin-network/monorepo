package publicwallet

import (
	"context"
	"log/slog"

	"github.com/ethereum/go-ethereum/common"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func (impl publicWalletImpl) CheckIfExistsByID(ctx context.Context, id primitive.ObjectID) (bool, error) {
	filter := bson.M{"_id": id}
	count, err := impl.Collection.CountDocuments(ctx, filter)
	if err != nil {
		impl.Logger.Error("database check if exists by ID error", slog.Any("error", err))
		return false, err
	}
	return count >= 1, nil
}

func (impl publicWalletImpl) CheckIfExistsByAddress(ctx context.Context, address *common.Address) (bool, error) {
	filter := bson.M{"address": address}
	count, err := impl.Collection.CountDocuments(ctx, filter)
	if err != nil {
		impl.Logger.Error("database check if exists by address error", slog.Any("error", err))
		return false, err
	}
	return count >= 1, nil
}
