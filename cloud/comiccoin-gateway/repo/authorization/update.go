// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/repo/authorization/update.go
package authorization

import (
	"context"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson"

	dom_auth "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/domain/authorization"
)

func (impl authorizationStorerImpl) MarkCodeAsUsed(ctx context.Context, code string) error {
	filter := bson.M{"code": code, "is_used": false}
	update := bson.M{
		"$set": bson.M{
			"is_used":    true,
			"updated_at": time.Now(),
		},
	}

	result, err := impl.Collection.UpdateOne(ctx, filter, update)
	if err != nil {
		impl.Logger.Error("failed to mark authorization code as used",
			slog.String("code", code),
			slog.Any("error", err))
		return err
	}

	if result.MatchedCount == 0 {
		impl.Logger.Warn("no unused authorization code found to mark as used",
			slog.String("code", code))
	}

	return nil
}

func (r *authorizationStorerImpl) UpdateCode(ctx context.Context, code *dom_auth.AuthorizationCode) error {

	filter := bson.M{"_id": code.ID}
	update := bson.M{"$set": code}

	_, err := r.Collection.UpdateOne(ctx, filter, update)
	return err
}
