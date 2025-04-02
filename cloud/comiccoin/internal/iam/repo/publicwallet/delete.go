package publicwallet

import (
	"context"
	"log/slog"

	"github.com/ethereum/go-ethereum/common"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func (impl publicWalletImpl) DeleteByID(ctx context.Context, id primitive.ObjectID) error {
	_, err := impl.Collection.DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		impl.Logger.Error("database failed deletion error",
			slog.Any("error", err))
		return err
	}
	return nil
}

func (impl publicWalletImpl) DeleteByAddress(ctx context.Context, address *common.Address) error {
	_, err := impl.Collection.DeleteOne(ctx, bson.M{"address": address})
	if err != nil {
		impl.Logger.Error("database failed deletion error",
			slog.Any("error", err))
		return err
	}
	return nil
}
