// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/repo/oauthsession/update.go
package oauthsession

import (
	"context"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson"

	dom_oauthsession "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/domain/oauthsession"
)

func (impl oauthSessionStorerImpl) Update(ctx context.Context, session *dom_oauthsession.OAuthSession) error {
	filter := bson.M{"session_id": session.SessionID}

	update := bson.M{
		"$set": bson.M{
			"access_token": session.AccessToken,
			"expires_at":   session.ExpiresAt,
			"last_used_at": time.Now(),
		},
	}

	result, err := impl.Collection.UpdateOne(ctx, filter, update)
	if err != nil {
		impl.Logger.Error("failed to update oauth session",
			slog.String("session_id", session.SessionID),
			slog.Any("error", err))
		return err
	}

	if result.ModifiedCount > 0 {
		impl.Logger.Info("updated oauth session",
			slog.String("session_id", session.SessionID))
	}

	return nil
}
