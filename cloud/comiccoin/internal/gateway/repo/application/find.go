// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/repo/application/find.go
package application

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	dom_app "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/domain/application"
)

func (impl applicationStorerImpl) FindByAppID(ctx context.Context, appID string) (*dom_app.Application, error) {
	filter := bson.M{"app_id": appID}

	var result dom_app.Application
	err := impl.Collection.FindOne(ctx, filter).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		impl.Logger.Error("failed to find application by app_id",
			slog.String("app_id", appID),
			slog.Any("error", err))
		return nil, err
	}
	return &result, nil
}

func (impl applicationStorerImpl) FindByScope(ctx context.Context, scope string) ([]*dom_app.Application, error) {
	filter := bson.M{
		"scopes": scope,
		"active": true,
	}

	cursor, err := impl.Collection.Find(ctx, filter)
	if err != nil {
		impl.Logger.Error("failed to find applications by scope",
			slog.String("scope", scope),
			slog.Any("error", err))
		return nil, err
	}
	defer cursor.Close(ctx)

	var results []*dom_app.Application
	if err = cursor.All(ctx, &results); err != nil {
		impl.Logger.Error("failed to decode applications",
			slog.String("scope", scope),
			slog.Any("error", err))
		return nil, err
	}
	return results, nil
}
