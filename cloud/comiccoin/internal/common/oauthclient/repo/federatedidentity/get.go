// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/repo/federatedidentity/get.go
package federatedidentity

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	dom_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/domain/federatedidentity"
)

func (impl federatedidentityStorerImpl) GetByID(ctx context.Context, id primitive.ObjectID) (*dom_federatedidentity.FederatedIdentity, error) {
	filter := bson.M{"_id": id}

	var result dom_federatedidentity.FederatedIdentity
	err := impl.Collection.FindOne(ctx, filter).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			// This error means your query did not match any documents.
			return nil, nil
		}
		impl.Logger.Error("database get by federatedidentity id error", slog.Any("error", err))
		return nil, err
	}
	return &result, nil
}

func (impl federatedidentityStorerImpl) GetByEmail(ctx context.Context, email string) (*dom_federatedidentity.FederatedIdentity, error) {
	filter := bson.M{"email": email}

	var result dom_federatedidentity.FederatedIdentity
	err := impl.Collection.FindOne(ctx, filter).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			// This error means your query did not match any documents.
			return nil, nil
		}
		impl.Logger.Error("database get by email error", slog.Any("error", err))
		return nil, err
	}
	return &result, nil
}

func (impl federatedidentityStorerImpl) GetByVerificationCode(ctx context.Context, verificationCode string) (*dom_federatedidentity.FederatedIdentity, error) {
	filter := bson.M{"email_verification_code": verificationCode}

	var result dom_federatedidentity.FederatedIdentity
	err := impl.Collection.FindOne(ctx, filter).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			// This error means your query did not match any documents.
			return nil, nil
		}
		impl.Logger.Error("database get by verification code error", slog.Any("error", err))
		return nil, err
	}
	return &result, nil
}
