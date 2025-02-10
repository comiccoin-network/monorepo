// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/repo/token/store.go
package token

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"

	dom_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/token"
)

func (impl tokenStorerImpl) UpsertByUserID(ctx context.Context, token *dom_token.Token) error {
	// Ensure ID is set if not already
	if token.ID.IsZero() {
		token.ID = primitive.NewObjectID()
	}

	// Create filter for upsert
	filter := bson.M{"user_id": token.UserID}

	// Create update document
	update := bson.M{
		"$set": bson.M{
			"_id":           token.ID,
			"user_id":       token.UserID,
			"access_token":  token.AccessToken,
			"refresh_token": token.RefreshToken,
			"expires_at":    token.ExpiresAt,
		},
	}

	// Set upsert option to true
	opts := options.Update().SetUpsert(true)

	// Perform upsert operation
	result, err := impl.Collection.UpdateOne(ctx, filter, update, opts)
	if err != nil {
		impl.Logger.Error("failed to upsert token",
			slog.Any("user_id", token.UserID),
			slog.Any("error", err))
		return err
	}

	// Log the operation result
	if result.UpsertedCount > 0 {
		impl.Logger.Info("inserted new token",
			slog.Any("user_id", token.UserID))
	} else if result.ModifiedCount > 0 {
		impl.Logger.Info("updated existing token",
			slog.Any("user_id", token.UserID))
	}

	return nil
}
