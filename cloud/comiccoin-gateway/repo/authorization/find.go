// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/repo/authorization/find.go
package authorization

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	dom_auth "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/domain/authorization"
)

func (impl authorizationStorerImpl) FindByCode(ctx context.Context, code string) (*dom_auth.AuthorizationCode, error) {
	impl.Logger.Info("finding authorization code in database",
		slog.String("code", code))

	filter := bson.M{"code": code}
	impl.Logger.Debug("using filter", slog.Any("filter", filter))

	var result dom_auth.AuthorizationCode
	err := impl.Collection.FindOne(ctx, filter).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			impl.Logger.Info("no authorization code found",
				slog.String("code", code))
			return nil, nil
		}
		impl.Logger.Error("database error while finding authorization code",
			slog.String("code", code),
			slog.Any("error", err))
		return nil, err
	}

	impl.Logger.Info("found authorization code",
		slog.String("code", code),
		slog.String("app_id", result.AppID),
		slog.String("user_id", result.UserID),
		slog.Bool("is_used", result.IsUsed),
		slog.Time("expires_at", result.ExpiresAt))

	return &result, nil
}
