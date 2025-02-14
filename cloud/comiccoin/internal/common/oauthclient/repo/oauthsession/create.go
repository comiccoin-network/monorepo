// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/repo/oauthsession/create.go
package oauthsession

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"

	dom_oauthsession "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/domain/oauthsession"
)

func (impl oauthSessionStorerImpl) Create(ctx context.Context, session *dom_oauthsession.OAuthSession) error {
	// Ensure ID is set
	if session.ID.IsZero() {
		session.ID = primitive.NewObjectID()
	}

	_, err := impl.Collection.InsertOne(ctx, session)
	if err != nil {
		impl.Logger.Error("failed to create oauth session",
			slog.String("session_id", session.SessionID),
			slog.Any("error", err))
		return err
	}

	impl.Logger.Info("created oauth session",
		slog.String("session_id", session.SessionID))

	return nil
}
