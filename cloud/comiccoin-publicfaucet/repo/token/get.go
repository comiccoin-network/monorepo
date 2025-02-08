// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/repo/token/get.go
package token

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	dom_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/domain/token"
)

func (impl tokenStorerImpl) GetByUserID(ctx context.Context, userID primitive.ObjectID) (*dom_token.Token, error) {
	filter := bson.M{"user_id": userID}

	var result dom_token.Token
	err := impl.Collection.FindOne(ctx, filter).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		impl.Logger.Error("failed to find token",
			slog.Any("user_id", userID),
			slog.Any("error", err))
		return nil, err
	}

	return &result, nil
}
