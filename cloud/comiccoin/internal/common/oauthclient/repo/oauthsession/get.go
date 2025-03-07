// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/repo/oauthsession/get.go (continued)
package oauthsession

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	dom_oauthsession "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/domain/oauthsession"
)

func (impl oauthSessionStorerImpl) GetBySessionID(ctx context.Context, sessionID string) (*dom_oauthsession.OAuthSession, error) {
	filter := bson.M{"session_id": sessionID}

	var result dom_oauthsession.OAuthSession
	err := impl.Collection.FindOne(ctx, filter).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		impl.Logger.Error("failed to find oauth session",
			slog.String("session_id", sessionID),
			slog.Any("error", err))
		return nil, err
	}

	return &result, nil
}

func (impl oauthSessionStorerImpl) GetByFederatedIdentityID(ctx context.Context, federatedidentityID primitive.ObjectID) (*dom_oauthsession.OAuthSession, error) {
	filter := bson.M{"federatedidentity_id": federatedidentityID}

	var result dom_oauthsession.OAuthSession
	err := impl.Collection.FindOne(ctx, filter).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		impl.Logger.Error("failed to find oauth session",
			slog.Any("federatedidentity_id", federatedidentityID),
			slog.Any("error", err))
		return nil, err
	}

	return &result, nil
}
