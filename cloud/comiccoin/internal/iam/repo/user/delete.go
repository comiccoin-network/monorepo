// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/repo/user/delete.go
package user

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func (impl userStorerImpl) DeleteByID(ctx context.Context, id primitive.ObjectID) error {
	_, err := impl.Collection.DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		impl.Logger.Error("database failed deletion error",
			slog.Any("error", err))
		return err
	}
	return nil
}

func (impl userStorerImpl) DeleteByEmail(ctx context.Context, email string) error {
	_, err := impl.Collection.DeleteOne(ctx, bson.M{"email": email})
	if err != nil {
		impl.Logger.Error("database failed deletion error",
			slog.Any("error", err))
		return err
	}
	return nil
}
