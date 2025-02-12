// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/repo/authorization/store.go
package authorization

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"

	dom_auth "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/domain/authorization"
)

func (impl authorizationStorerImpl) StoreCode(ctx context.Context, code *dom_auth.AuthorizationCode) error {
	// Generate a new ObjectID if not provided
	if code.ID == primitive.NilObjectID {
		code.ID = primitive.NewObjectID()
		impl.Logger.Debug("generated new ObjectID for authorization code",
			slog.String("code_id", code.ID.Hex()),
			slog.String("app_id", code.AppID))
	}

	// Insert the authorization code
	result, err := impl.Collection.InsertOne(ctx, code)
	if err != nil {
		impl.Logger.Error("failed to store authorization code",
			slog.String("app_id", code.AppID),
			slog.String("federatedidentity_id", code.FederatedIdentityID),
			slog.Any("error", err))
		return err
	}

	impl.Logger.Info("stored new authorization code",
		slog.Any("_id", result.InsertedID),
		slog.String("app_id", code.AppID),
		slog.String("federatedidentity_id", code.FederatedIdentityID))
	return nil
}
