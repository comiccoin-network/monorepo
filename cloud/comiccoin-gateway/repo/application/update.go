// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/repo/application/update.go
package application

import (
	"context"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson"

	dom_app "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/domain/application"
)

func (impl applicationStorerImpl) Update(ctx context.Context, app *dom_app.Application) error {
	app.UpdatedAt = time.Now()

	filter := bson.M{"_id": app.ID}
	result, err := impl.Collection.ReplaceOne(ctx, filter, app)
	if err != nil {
		impl.Logger.Error("failed to update application",
			slog.String("app_id", app.AppID),
			slog.Any("error", err))
		return err
	}

	if result.MatchedCount == 0 {
		impl.Logger.Warn("no application found to update",
			slog.String("app_id", app.AppID))
	}

	return nil
}

func (impl applicationStorerImpl) UpdateLastUsed(ctx context.Context, appID string) error {
	filter := bson.M{"app_id": appID}
	update := bson.M{
		"$set": bson.M{
			"last_used_at": time.Now(),
			"updated_at":   time.Now(),
		},
	}

	result, err := impl.Collection.UpdateOne(ctx, filter, update)
	if err != nil {
		impl.Logger.Error("failed to update last_used_at",
			slog.String("app_id", appID),
			slog.Any("error", err))
		return err
	}

	if result.MatchedCount == 0 {
		impl.Logger.Warn("no application found to update last_used_at",
			slog.String("app_id", appID))
	}

	return nil
}
