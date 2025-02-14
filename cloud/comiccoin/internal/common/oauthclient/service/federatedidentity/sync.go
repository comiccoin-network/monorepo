package federatedidentity

import (
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	domain "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/domain/federatedidentity"
)

type FederatedIdentitySyncService interface {
	Execute(sessCtx mongo.SessionContext, federatedIdentityID primitive.ObjectID) (*domain.FederatedIdentity, error)
}

type federatedidentitySyncServiceImpl struct {
	logger *slog.Logger
}

func NewFederatedIdentitySyncService(
	logger *slog.Logger,
) FederatedIdentitySyncService {
	return &federatedidentitySyncServiceImpl{logger}
}

type FederatedIdentityFilterRequestID domain.FederatedIdentityFilter

type FederatedIdentityFilterResultResponseIDO domain.FederatedIdentityFilterResult

func (s *federatedidentitySyncServiceImpl) Execute(sessCtx mongo.SessionContext, federatedIdentityID primitive.ObjectID) (*domain.FederatedIdentity, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if federatedIdentityID.IsZero() {
		e["federated_identity_id"] = "Federated identity id is required"
	}
	if len(e) != 0 {
		s.logger.Warn("Failed validating",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Count in database.
	//

	// s.logger.Debug("fetched",
	// 	slog.Any("id", id),
	// 	slog.Any("detail", detail))

	return nil, nil
}
