// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/repo/token/find.go
package token

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	dom_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/domain/token"
)

func (impl tokenStorerImpl) FindByTokenID(ctx context.Context, tokenID string) (*dom_token.Token, error) {
	filter := bson.M{"token_id": tokenID}

	var result dom_token.Token
	err := impl.Collection.FindOne(ctx, filter).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, dom_token.ErrTokenNotFound
		}
		impl.Logger.Error("failed to find token",
			slog.String("token_id", tokenID),
			slog.Any("error", err))
		return nil, err
	}

	return &result, nil
}
