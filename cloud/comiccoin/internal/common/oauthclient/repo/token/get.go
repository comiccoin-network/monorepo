// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/repo/token/get.go
package token

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	dom_token "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/domain/token"
)

func (impl tokenStorerImpl) GetByFederatedIdentityID(ctx context.Context, federatedidentityID primitive.ObjectID) (*dom_token.Token, error) {
	filter := bson.M{"federatedidentity_id": federatedidentityID}

	var result dom_token.Token
	err := impl.Collection.FindOne(ctx, filter).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		impl.Logger.Error("failed to find token",
			slog.Any("federatedidentity_id", federatedidentityID),
			slog.Any("error", err))
		return nil, err
	}

	return &result, nil
}
