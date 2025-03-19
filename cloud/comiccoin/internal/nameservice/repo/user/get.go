// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/nameservice/repo/user/get.go
package user

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	dom_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/nameservice/domain/user"
	"github.com/ethereum/go-ethereum/common"
)

func (impl userStorerImpl) GetByID(ctx context.Context, id primitive.ObjectID) (*dom_user.User, error) {
	filter := bson.M{"_id": id}

	var result dom_user.User
	err := impl.Collection.FindOne(ctx, filter).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			// This error means your query did not match any documents.
			return nil, nil
		}
		impl.Logger.Error("database get by user id error", slog.Any("error", err))
		return nil, err
	}
	return &result, nil
}

func (impl userStorerImpl) GetByEmail(ctx context.Context, email string) (*dom_user.User, error) {
	filter := bson.M{"email": email}

	var result dom_user.User
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

func (impl userStorerImpl) GetByVerificationCode(ctx context.Context, verificationCode string) (*dom_user.User, error) {
	filter := bson.M{"email_verification_code": verificationCode}

	var result dom_user.User
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

func (impl userStorerImpl) GetByWalletAddress(ctx context.Context, walletAddress *common.Address) (*dom_user.User, error) {
	filter := bson.M{"wallet_address": walletAddress}

	var result dom_user.User
	err := impl.Collection.FindOne(ctx, filter).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			// This error means your query did not match any documents.
			return nil, nil
		}
		impl.Logger.Error("database get by wallet address error", slog.Any("error", err))
		return nil, err
	}
	return &result, nil
}
