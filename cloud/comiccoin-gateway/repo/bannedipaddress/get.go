package bannedipaddress

import (
	"context"
	"log/slog"
	"math/big"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/domain"
)

func (impl bannedIPAddressImpl) GetByID(ctx context.Context, id primitive.ObjectID) (*domain.BannedIPAddress, error) {
	filter := bson.M{"_id": id}

	var result domain.BannedIPAddress
	err := impl.Collection.FindOne(ctx, filter).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			// This error means your query did not match any documents.
			return nil, nil
		}
		impl.Logger.Error("database get by user transaction id error", slog.Any("error", err))
		return nil, err
	}
	return &result, nil
}

func (impl bannedIPAddressImpl) GetByNonce(ctx context.Context, nonce *big.Int) (*domain.BannedIPAddress, error) {
	filter := bson.M{"transaction.nonce_bytes": nonce.Bytes()}

	var result domain.BannedIPAddress
	err := impl.Collection.FindOne(ctx, filter).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			// This error means your query did not match any documents.
			return nil, nil
		}
		impl.Logger.Error("database get by user transaction nonce error", slog.Any("error", err))
		return nil, err
	}
	return &result, nil
}
