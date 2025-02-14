// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/repo/authorization/update.go
package authorization

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson"

	dom_auth "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/domain/authorization"
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
	// First find the existing authorization code to get its _id
	existingCode, err := r.FindByCode(ctx, code.Code)
	if err != nil {
		r.Logger.Error("failed to find existing authorization code",
			slog.String("code", code.Code),
			slog.Any("error", err))
		return err
	}
	if existingCode == nil {
		r.Logger.Warn("no authorization code found",
			slog.String("code", code.Code))
		return fmt.Errorf("authorization code not found")
	}

	// Use the existing _id in the filter
	filter := bson.M{
		"_id":  existingCode.ID,
		"code": code.Code,
	}

	// Only update specific fields, not the entire document
	update := bson.M{
		"$set": bson.M{
			"federatedidentity_id": code.FederatedIdentityID,
			"updated_at":           time.Now(),
			// Add any other fields that need updating, but NOT _id
		},
	}

	result, err := r.Collection.UpdateOne(ctx, filter, update)
	if err != nil {
		r.Logger.Error("failed to update authorization code",
			slog.String("code", code.Code),
			slog.String("federatedidentity_id", code.FederatedIdentityID),
			slog.Any("error", err))
		return err
	}

	if result.ModifiedCount == 0 {
		r.Logger.Warn("no authorization code found to update",
			slog.String("code", code.Code))
		return fmt.Errorf("authorization code not found")
	}

	r.Logger.Info("successfully updated authorization code",
		slog.String("code", code.Code),
		slog.String("federatedidentity_id", code.FederatedIdentityID),
		slog.Any("_id", existingCode.ID))

	return nil
}
