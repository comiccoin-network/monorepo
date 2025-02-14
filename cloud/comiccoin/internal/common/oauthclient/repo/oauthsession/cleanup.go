// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/repo/oauthsession/cleanup.go
package oauthsession

import (
	"context"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson"
)

func (impl oauthSessionStorerImpl) DeleteExpired(ctx context.Context) error {
	filter := bson.M{
		"expires_at": bson.M{"$lt": time.Now()},
	}

	result, err := impl.Collection.DeleteMany(ctx, filter)
	if err != nil {
		impl.Logger.Error("failed to delete expired oauth sessions",
			slog.Any("error", err))
		return err
	}

	if result.DeletedCount > 0 {
		impl.Logger.Info("deleted expired oauth sessions",
			slog.Int64("deleted_count", result.DeletedCount))
	}

	return nil
}
