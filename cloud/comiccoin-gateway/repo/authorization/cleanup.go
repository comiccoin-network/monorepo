// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/repo/authorization/cleanup.go
package authorization

import (
	"context"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson"
)

func (impl authorizationStorerImpl) DeleteExpiredCodes(ctx context.Context) error {
	filter := bson.M{
		"expires_at": bson.M{"$lt": time.Now()},
	}

	result, err := impl.Collection.DeleteMany(ctx, filter)
	if err != nil {
		impl.Logger.Error("failed to delete expired authorization codes",
			slog.Any("error", err))
		return err
	}

	if result.DeletedCount > 0 {
		impl.Logger.Info("deleted expired authorization codes",
			slog.Int64("deleted_count", result.DeletedCount))
	}

	return nil
}
