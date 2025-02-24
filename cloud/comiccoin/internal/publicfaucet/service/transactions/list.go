// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/service/transactions/list.go
package transactions

import (
	"errors"
	"log/slog"
	"sort"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	dom_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/domain/user"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/usecase/user"
)

type GetUserTransactionsService interface {
	Execute(sessCtx mongo.SessionContext) ([]*dom_user.UserClaimedCoinTransaction, error)
}

type getUserTransactionsServiceImpl struct {
	config                              *config.Configuration
	logger                              *slog.Logger
	userGetByFederatedIdentityIDUseCase uc_user.UserGetByFederatedIdentityIDUseCase
}

func NewGetUserTransactionsService(
	config *config.Configuration,
	logger *slog.Logger,
	userGetByFederatedIdentityIDUseCase uc_user.UserGetByFederatedIdentityIDUseCase,
) GetUserTransactionsService {
	return &getUserTransactionsServiceImpl{
		config:                              config,
		logger:                              logger,
		userGetByFederatedIdentityIDUseCase: userGetByFederatedIdentityIDUseCase,
	}
}

func (svc *getUserTransactionsServiceImpl) Execute(sessCtx mongo.SessionContext) ([]*dom_user.UserClaimedCoinTransaction, error) {
	svc.logger.Debug("executing...")

	// Get authenticated federatedidentity ID from context. This is loaded in
	// by the `AuthMiddleware` found via:
	// - github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/interface/http/middleware/auth.go
	federatedidentityID, ok := sessCtx.Value("federatedidentity_id").(primitive.ObjectID)
	if !ok {
		svc.logger.Error("Failed getting local federatedidentity id",
			slog.Any("error", "Not found in context: federatedidentity_id"))
		return nil, errors.New("federatedidentity_id has issue in context")
	}

	//
	// Get related records.
	//

	user, err := svc.userGetByFederatedIdentityIDUseCase.Execute(sessCtx, federatedidentityID)
	if err != nil {
		svc.logger.Error("failed getting user error", slog.Any("err", err))
		return nil, err
	}

	sort.Slice(user.ClaimedCoinTransactions, func(i, j int) bool {
		return user.ClaimedCoinTransactions[i].Timestamp.After(user.ClaimedCoinTransactions[j].Timestamp)
	})
	return user.ClaimedCoinTransactions, nil

}
