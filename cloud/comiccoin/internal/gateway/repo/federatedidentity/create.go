// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/repo/federatedidentity/create.go
package federatedidentity

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"

	dom_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/domain/federatedidentity"
)

func (impl federatedidentityStorerImpl) Create(ctx context.Context, u *dom_federatedidentity.FederatedIdentity) error {
	// DEVELOPER NOTES:
	// According to mongodb documentaiton:
	//     Non-existent Databases and Collections
	//     If the necessary database and collection don't exist when you perform a write operation, the server implicitly creates them.
	//     Source: https://www.mongodb.com/docs/drivers/go/current/usage-examples/insertOne/

	if u.ID == primitive.NilObjectID {
		u.ID = primitive.NewObjectID()
		impl.Logger.Warn("database insert federatedidentity not included id value, created id now.", slog.Any("id", u.ID))
	}

	_, err := impl.Collection.InsertOne(ctx, u)

	// check for errors in the insertion
	if err != nil {
		impl.Logger.Error("database failed create error",
			slog.Any("error", err))
		return err
	}

	return nil
}
