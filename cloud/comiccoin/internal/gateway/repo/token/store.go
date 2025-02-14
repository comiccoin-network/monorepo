// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/repo/token/store.go
package token

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"

	dom_token "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/domain/token"
)

func (impl tokenStorerImpl) StoreToken(ctx context.Context, token *dom_token.Token) error {
	// Generate a new ObjectID if not provided
	if token.ID == primitive.NilObjectID {
		token.ID = primitive.NewObjectID()
		impl.Logger.Debug("generated new ObjectID for token",
			slog.String("token_id", token.TokenID),
			slog.String("token_type", token.TokenType))
	}

	// Insert the token
	result, err := impl.Collection.InsertOne(ctx, token)
	if err != nil {
		impl.Logger.Error("failed to store token",
			slog.String("token_type", token.TokenType),
			slog.String("federatedidentity_id", token.FederatedIdentityID),
			slog.String("app_id", token.AppID),
			slog.Any("error", err))
		return err
	}

	impl.Logger.Info("stored new token",
		slog.Any("_id", result.InsertedID),
		slog.String("token_type", token.TokenType),
		slog.String("federatedidentity_id", token.FederatedIdentityID),
		slog.String("app_id", token.AppID))
	return nil
}
