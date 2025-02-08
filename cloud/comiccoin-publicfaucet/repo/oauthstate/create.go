// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/repo/oauthstate/create.go
package oauthstate

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"

	dom_oauthstate "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/domain/oauthstate"
)

func (impl oauthStateStorerImpl) Create(ctx context.Context, state *dom_oauthstate.OAuthState) error {
	// Ensure ID is set
	if state.ID.IsZero() {
		state.ID = primitive.NewObjectID()
	}

	_, err := impl.Collection.InsertOne(ctx, state)
	if err != nil {
		impl.Logger.Error("failed to create oauth state",
			slog.String("state", state.State),
			slog.Any("error", err))
		return err
	}

	impl.Logger.Info("created oauth state",
		slog.String("state", state.State))

	return nil
}
