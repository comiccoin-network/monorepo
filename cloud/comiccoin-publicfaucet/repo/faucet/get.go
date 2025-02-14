package faucet

import (
	"context"
	"log/slog"

	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/domain/faucet"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func (impl faucetImpl) GetByID(ctx context.Context, id primitive.ObjectID) (*dom.Faucet, error) {
	filter := bson.M{"_id": id}

	var result dom.Faucet
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

func (impl faucetImpl) GetByChainID(ctx context.Context, chainID uint16) (*dom.Faucet, error) {
	filter := bson.M{"chain_id": chainID}

	var result dom.Faucet
	err := impl.Collection.FindOne(ctx, filter).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			// This error means your query did not match any documents.
			return nil, nil
		}
		impl.Logger.Error("database get by chain id error", slog.Any("error", err))
		return nil, err
	}
	return &result, nil
}
