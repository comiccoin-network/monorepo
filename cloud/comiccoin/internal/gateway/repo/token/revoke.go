// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/repo/token/revoke.go
package token

import (
	"context"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson"
)

func (impl tokenStorerImpl) RevokeToken(ctx context.Context, tokenID string) error {
	filter := bson.M{
		"token_id":   tokenID,
		"is_revoked": false,
	}
	update := bson.M{
		"$set": bson.M{
			"is_revoked": true,
			"expires_at": time.Now(), // Immediately expire the token
		},
	}

	result, err := impl.Collection.UpdateOne(ctx, filter, update)
	if err != nil {
		impl.Logger.Error("failed to revoke token",
			slog.String("token_id", tokenID),
			slog.Any("error", err))
		return err
	}

	if result.MatchedCount == 0 {
		impl.Logger.Warn("no active token found to revoke",
			slog.String("token_id", tokenID))
	}

	return nil
}

func (impl tokenStorerImpl) RevokeAllFederatedIdentityTokens(ctx context.Context, federatedidentityID string) error {
	filter := bson.M{
		"federatedidentity_id": federatedidentityID,
		"is_revoked":           false,
	}
	update := bson.M{
		"$set": bson.M{
			"is_revoked": true,
			"expires_at": time.Now(), // Immediately expire all tokens
		},
	}

	result, err := impl.Collection.UpdateMany(ctx, filter, update)
	if err != nil {
		impl.Logger.Error("failed to revoke all federatedidentity tokens",
			slog.String("federatedidentity_id", federatedidentityID),
			slog.Any("error", err))
		return err
	}

	if result.ModifiedCount > 0 {
		impl.Logger.Info("revoked all federatedidentity tokens",
			slog.String("federatedidentity_id", federatedidentityID),
			slog.Int64("revoked_count", result.ModifiedCount))
	}

	return nil
}
