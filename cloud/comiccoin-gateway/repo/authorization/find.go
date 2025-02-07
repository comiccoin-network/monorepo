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
	filter := bson.M{"code": code}

	var result dom_auth.AuthorizationCode
	err := impl.Collection.FindOne(ctx, filter).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		impl.Logger.Error("failed to find authorization code",
			slog.String("code", code),
			slog.Any("error", err))
		return nil, err
	}

	return &result, nil
}
