// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/nameservice/service/dashboard/get.go
package dashboard

import (
	"log/slog"

	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/nameservice/usecase/user"
)

type DashboardDTO struct {
	ChainID uint16 `bson:"chain_id" json:"chain_id"`
}

type GetDashboardService interface {
	Execute(sessCtx mongo.SessionContext) (*DashboardDTO, error)
}

type getDashboardServiceImpl struct {
	config             *config.Configuration
	logger             *slog.Logger
	userGetByIDUseCase uc_user.UserGetByIDUseCase
}

func NewGetDashboardService(
	config *config.Configuration,
	logger *slog.Logger,
	userGetByIDUseCase uc_user.UserGetByIDUseCase,
) GetDashboardService {
	return &getDashboardServiceImpl{
		config:             config,
		logger:             logger,
		userGetByIDUseCase: userGetByIDUseCase,
	}
}

func (svc *getDashboardServiceImpl) Execute(sessCtx mongo.SessionContext) (*DashboardDTO, error) {
	// //
	// // Get required from context.
	// //
	//
	// userID, ok := sessCtx.Value(constants.SessionUserID).(primitive.ObjectID)
	// if !ok {
	// 	svc.logger.Error("Failed getting local user id",
	// 		slog.Any("error", "Not found in context: user_id"))
	// 	return nil, errors.New("user id not found in context")
	// }
	// svc.logger.Debug("Extracted from local context",
	// 	slog.Any("userID", userID))
	//
	// //
	// // Get related records.
	// //
	//
	// nameservice, err := svc.getFaucetByChainIDUseCase.Execute(sessCtx, svc.config.Blockchain.ChainID)
	// if err != nil {
	// 	svc.logger.Error("failed getting nameservice by chain id error", slog.Any("err", err))
	// 	return nil, err
	// }
	// if nameservice == nil {
	// 	err := fmt.Errorf("nameservice d.n.e. for chain ID: %v", svc.config.Blockchain.ChainID)
	// 	svc.logger.Error("failed getting nameservice by chain id error", slog.Any("err", err))
	// 	return nil, err
	// }
	// user, err := svc.userGetByIDUseCase.Execute(sessCtx, userID)
	// if err != nil {
	// 	svc.logger.Error("failed getting user error", slog.Any("err", err))
	// 	return nil, err
	// }
	// if user == nil {
	// 	err := fmt.Errorf("User does not exist for user id: %v", userID.Hex())
	// 	svc.logger.Error("Failed getting user by user id", slog.Any("error", err))
	// 	return nil, err
	// }
	//
	// //
	// // Get remote records.
	// //
	//
	// // Developers note: Remote server returns 404 error if account d.n.e. which is OK,
	// // as a result, we will skip any errors here and only check if we get user
	// // wallet balance response.
	// var userWalletBalance uint64
	// remoteAccount, _ := svc.fetchRemoteAccountBalanceFromAuthorityUseCase.Execute(sessCtx, user.WalletAddress)
	// if remoteAccount != nil {
	// 	userWalletBalance = remoteAccount.Balance
	// }
	//
	// //
	// // Return the results
	// //
	//
	// // Special circumstance #1
	// var canClaim bool
	// if user.LastClaimTime.IsZero() || user.NextClaimTime.IsZero() {
	// 	canClaim = true
	// } else {
	// 	canClaim = time.Now().After(user.NextClaimTime)
	// }
	//
	// // Special circumstance #2
	// if user.ClaimedCoinTransactions == nil {
	// 	user.ClaimedCoinTransactions = make([]*dom_user.UserClaimedCoinTransaction, 0)
	// }
	//
	// // Apply sorting so most recent transactions will be at the top.
	// sort.Slice(user.ClaimedCoinTransactions, func(i, j int) bool {
	// 	return user.ClaimedCoinTransactions[i].Timestamp.After(user.ClaimedCoinTransactions[j].Timestamp)
	// })
	//
	// // Limit transactions to maximum of 5
	// var limitedTransactions []*dom_user.UserClaimedCoinTransaction
	// if len(user.ClaimedCoinTransactions) <= 5 {
	// 	limitedTransactions = user.ClaimedCoinTransactions
	// } else {
	// 	limitedTransactions = user.ClaimedCoinTransactions[:5]
	// }

	// Return our dashboard response.
	return &DashboardDTO{
		// ChainID:                 nameservice.ChainID,
		// FaucetBalance:           nameservice.Balance,
		// UserBalance:             userWalletBalance,
		// TotalCoinsClaimedByUser: user.TotalCoinsClaimed,
		// Transactions:            limitedTransactions,
		// LastModifiedAt:          nameservice.LastModifiedAt,
		// LastClaimTime:           user.LastClaimTime,
		// NextClaimTime:           user.NextClaimTime,
		// CanClaim:                canClaim,
		// WalletAddress:           user.WalletAddress,
	}, nil
}
