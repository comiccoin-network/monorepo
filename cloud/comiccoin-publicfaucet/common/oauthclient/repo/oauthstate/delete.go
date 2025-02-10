// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/repo/oauthstate/delete.go
package oauthstate

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson"
)

func (impl oauthStateStorerImpl) Delete(ctx context.Context, state string) error {
	filter := bson.M{"state": state}

	result, err := impl.Collection.DeleteOne(ctx, filter)
	if err != nil {
		impl.Logger.Error("failed to delete oauth state",
			slog.String("state", state),
			slog.Any("error", err))
		return err
	}

	if result.DeletedCount > 0 {
		impl.Logger.Info("deleted oauth state",
			slog.String("state", state))
	}

	return nil
}
