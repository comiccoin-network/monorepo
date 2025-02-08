// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/repo/oauthstate/get.go
package oauthstate

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	dom_oauthstate "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/domain/oauthstate"
)

func (impl oauthStateStorerImpl) GetByState(ctx context.Context, state string) (*dom_oauthstate.OAuthState, error) {
	filter := bson.M{"state": state}

	var result dom_oauthstate.OAuthState
	err := impl.Collection.FindOne(ctx, filter).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		impl.Logger.Error("failed to find oauth state",
			slog.String("state", state),
			slog.Any("error", err))
		return nil, err
	}

	return &result, nil
}
