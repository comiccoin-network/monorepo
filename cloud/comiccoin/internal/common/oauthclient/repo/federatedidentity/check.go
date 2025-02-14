// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/repo/federatedidentity/check.go
package federatedidentity

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func (impl federatedidentityStorerImpl) CheckIfExistsByID(ctx context.Context, id primitive.ObjectID) (bool, error) {
	filter := bson.M{"_id": id}
	count, err := impl.Collection.CountDocuments(ctx, filter)
	if err != nil {
		impl.Logger.Error("database check if exists by ID error", slog.Any("error", err))
		return false, err
	}
	return count >= 1, nil
}

func (impl federatedidentityStorerImpl) CheckIfExistsByEmail(ctx context.Context, email string) (bool, error) {
	filter := bson.M{"email": email}
	count, err := impl.Collection.CountDocuments(ctx, filter)
	if err != nil {
		impl.Logger.Error("database check if exists by email error", slog.Any("error", err))
		return false, err
	}
	return count >= 1, nil
}
