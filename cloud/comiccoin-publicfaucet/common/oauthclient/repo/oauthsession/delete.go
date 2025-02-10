// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/repo/oauthsession/delete.go
package oauthsession

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson"
)

func (impl oauthSessionStorerImpl) Delete(ctx context.Context, sessionID string) error {
	filter := bson.M{"session_id": sessionID}

	result, err := impl.Collection.DeleteOne(ctx, filter)
	if err != nil {
		impl.Logger.Error("failed to delete oauth session",
			slog.String("session_id", sessionID),
			slog.Any("error", err))
		return err
	}

	if result.DeletedCount > 0 {
		impl.Logger.Info("deleted oauth session",
			slog.String("session_id", sessionID))
	}

	return nil
}
