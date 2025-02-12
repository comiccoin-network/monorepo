// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/repo/federatedidentity/delete.go
package federatedidentity

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func (impl federatedidentityStorerImpl) DeleteByID(ctx context.Context, id primitive.ObjectID) error {
	_, err := impl.Collection.DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		impl.Logger.Error("database failed deletion error",
			slog.Any("error", err))
		return err
	}
	return nil
}
