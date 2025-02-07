// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/repo/application/operations.go
package application

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson"
)

func (impl applicationStorerImpl) Delete(ctx context.Context, appID string) error {
	filter := bson.M{"app_id": appID}

	result, err := impl.Collection.DeleteOne(ctx, filter)
	if err != nil {
		impl.Logger.Error("failed to delete application",
			slog.String("app_id", appID),
			slog.Any("error", err))
		return err
	}

	if result.DeletedCount == 0 {
		impl.Logger.Warn("no application found to delete",
			slog.String("app_id", appID))
	}

	return nil
}

func (impl applicationStorerImpl) ValidateCredentials(ctx context.Context, appID, appSecret string) (bool, error) {
	filter := bson.M{
		"app_id":     appID,
		"app_secret": appSecret,
		"active":     true,
	}

	count, err := impl.Collection.CountDocuments(ctx, filter)
	if err != nil {
		impl.Logger.Error("failed to validate credentials",
			slog.String("app_id", appID),
			slog.Any("error", err))
		return false, err
	}

	return count > 0, nil
}
