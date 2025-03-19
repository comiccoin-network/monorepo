// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/nameservice/service/transactions/list.go
package transactions

import (
	"errors"
	"log/slog"
	"sort"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config/constants"
	dom_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/nameservice/domain/user"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/nameservice/usecase/user"
)

type GetUserTransactionsService interface {
	Execute(sessCtx mongo.SessionContext) ([]*dom_user.UserClaimedCoinTransaction, error)
}

type getUserTransactionsServiceImpl struct {
	config             *config.Configuration
	logger             *slog.Logger
	userGetByIDUseCase uc_user.UserGetByIDUseCase
}

func NewGetUserTransactionsService(
	config *config.Configuration,
	logger *slog.Logger,
	userGetByIDUseCase uc_user.UserGetByIDUseCase,
) GetUserTransactionsService {
	return &getUserTransactionsServiceImpl{
		config:             config,
		logger:             logger,
		userGetByIDUseCase: userGetByIDUseCase,
	}
}

func (svc *getUserTransactionsServiceImpl) Execute(sessCtx mongo.SessionContext) ([]*dom_user.UserClaimedCoinTransaction, error) {
	//
	// Get required from context.
	//

	userID, ok := sessCtx.Value(constants.SessionUserID).(primitive.ObjectID)
	if !ok {
		svc.logger.Error("Failed getting local user id",
			slog.Any("error", "Not found in context: user_id"))
		return nil, errors.New("user id not found in context")
	}

	//
	// Get related records.
	//

	user, err := svc.userGetByIDUseCase.Execute(sessCtx, userID)
	if err != nil {
		svc.logger.Error("failed getting user error", slog.Any("err", err))
		return nil, err
	}

	sort.Slice(user.ClaimedCoinTransactions, func(i, j int) bool {
		return user.ClaimedCoinTransactions[i].Timestamp.After(user.ClaimedCoinTransactions[j].Timestamp)
	})
	return user.ClaimedCoinTransactions, nil

}
