package publicwallet

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/publicwallet"
	"github.com/ethereum/go-ethereum/common"
)

func (impl publicWalletImpl) GetByID(ctx context.Context, id primitive.ObjectID) (*dom.PublicWallet, error) {
	filter := bson.M{"_id": id}

	var result dom.PublicWallet
	err := impl.Collection.FindOne(ctx, filter).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			// This error means your query did not match any documents.
			return nil, nil
		}
		impl.Logger.Error("database get by id error", slog.Any("error", err))
		return nil, err
	}
	return &result, nil
}

func (impl publicWalletImpl) GetByAddress(ctx context.Context, address *common.Address) (*dom.PublicWallet, error) {
	filter := bson.M{"address": address}

	var result dom.PublicWallet
	err := impl.Collection.FindOne(ctx, filter).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			// This error means your query did not match any documents.
			return nil, nil
		}
		impl.Logger.Error("database get by address error", slog.Any("error", err))
		return nil, err
	}
	return &result, nil
}
