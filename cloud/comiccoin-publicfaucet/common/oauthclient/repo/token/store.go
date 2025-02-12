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

func (impl tokenStorerImpl) UpsertByFederatedIdentityID(ctx context.Context, token *dom_token.Token) error {
	// First, try to find existing token to preserve its ID
	existingToken, err := impl.GetByFederatedIdentityID(ctx, token.FederatedIdentityID)
	if err != nil {
		impl.Logger.Error("failed to check for existing token",
			slog.Any("federatedidentity_id", token.FederatedIdentityID),
			slog.Any("error", err))
		return err
	}

	// If we found an existing token, use its ID
	if existingToken != nil {
		token.ID = existingToken.ID
	} else {
		// Only generate new ID if we don't have an existing token
		token.ID = primitive.NewObjectID()
	}

	// Create filter for upsert - we match on federatedidentity_id
	filter := bson.M{"federatedidentity_id": token.FederatedIdentityID}

	// Create update document WITHOUT including _id in the $set
	update := bson.M{
		"$set": bson.M{
			"federatedidentity_id":       token.FederatedIdentityID,
			"access_token":  token.AccessToken,
			"refresh_token": token.RefreshToken,
			"expires_at":    token.ExpiresAt,
		},
	}

	// Use upsert option
	opts := options.Update().SetUpsert(true)

	// Perform upsert operation
	result, err := impl.Collection.UpdateOne(ctx, filter, update, opts)
	if err != nil {
		impl.Logger.Error("failed to upsert token",
			slog.String("token_id", token.ID.Hex()),
			slog.Any("federatedidentity_id", token.FederatedIdentityID),
			slog.Any("error", err))
		return err
	}

	// If this was a new insert, log the new ID
	if result.UpsertedCount > 0 {
		impl.Logger.Info("inserted new token",
			slog.String("token_id", token.ID.Hex()),
			slog.Any("federatedidentity_id", token.FederatedIdentityID))
	} else if result.ModifiedCount > 0 {
		impl.Logger.Info("updated existing token",
			slog.String("token_id", token.ID.Hex()),
			slog.Any("federatedidentity_id", token.FederatedIdentityID))
	}

	return nil
}
