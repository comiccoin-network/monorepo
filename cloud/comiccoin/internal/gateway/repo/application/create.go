// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/repo/application/create.go
package application

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"

	dom_app "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/domain/application"
)

func (impl applicationStorerImpl) Create(ctx context.Context, app *dom_app.Application) error {
	// Ensure we have a valid ObjectID
	if app.ID == primitive.NilObjectID {
		app.ID = primitive.NewObjectID()
		impl.Logger.Debug("generated new ObjectID for application",
			slog.String("app_id", app.AppID),
			slog.Any("object_id", app.ID))
	}

	// Perform the insertion
	result, err := impl.Collection.InsertOne(ctx, app)
	if err != nil {
		impl.Logger.Error("failed to create application",
			slog.String("app_id", app.AppID),
			slog.Any("error", err))
		return err
	}

	impl.Logger.Info("created new application",
		slog.String("app_id", app.AppID),
		slog.Any("_id", result.InsertedID))
	return nil
}
