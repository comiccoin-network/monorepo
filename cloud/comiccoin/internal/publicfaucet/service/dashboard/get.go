// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/service/dashboard/get.go
package dashboard

import (
	"errors"
	"fmt"
	"log/slog"
	"time"

	"github.com/ethereum/go-ethereum/common"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	dom_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/domain/user"
	uc_faucet "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/usecase/faucet"
	uc_remoteaccountbalance "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/usecase/remoteaccountbalance"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/usecase/user"
)

type DashboardDTO struct {
	ChainID                 uint16    `bson:"chain_id" json:"chain_id"`
	FaucetBalance           uint64    `bson:"faucet_balance" json:"faucet_balance"`
	UserBalance             uint64    `bson:"user_balance" json:"user_balance"`
	TotalCoinsClaimedByUser uint64    `bson:"total_coins_claimed_by_user" json:"total_coins_claimed"`
	LastModifiedAt          time.Time `bson:"last_modified_at,omitempty" json:"last_modified_at,omitempty"`

	LastClaimTime time.Time       `bson:"last_claim_time" json:"last_claim_time"`
	NextClaimTime time.Time       `bson:"next_claim_time" json:"next_claim_time"`
	CanClaim      bool            `bson:"can_claim" json:"can_claim"`
	WalletAddress *common.Address `bson:"wallet_address" json:"wallet_address"`

	// Keep track of all of the transactions that the user claimed.
	Transactions []*dom_user.UserClaimedCoinTransaction `bson:"transactions" json:"transactions"`
}

type GetDashboardService interface {
	Execute(sessCtx mongo.SessionContext) (*DashboardDTO, error)
}

type getDashboardServiceImpl struct {
	config                                        *config.Configuration
	logger                                        *slog.Logger
	getFaucetByChainIDUseCase                     uc_faucet.GetFaucetByChainIDUseCase
	userGetByFederatedIdentityIDUseCase           uc_user.UserGetByFederatedIdentityIDUseCase
	fetchRemoteAccountBalanceFromAuthorityUseCase uc_remoteaccountbalance.FetchRemoteAccountBalanceFromAuthorityUseCase
}

func NewGetDashboardService(
	config *config.Configuration,
	logger *slog.Logger,
	getFaucetByChainIDUseCase uc_faucet.GetFaucetByChainIDUseCase,
	userGetByFederatedIdentityIDUseCase uc_user.UserGetByFederatedIdentityIDUseCase,
	fetchRemoteAccountBalanceFromAuthorityUseCase uc_remoteaccountbalance.FetchRemoteAccountBalanceFromAuthorityUseCase,
) GetDashboardService {
	return &getDashboardServiceImpl{
		config:                              config,
		logger:                              logger,
		getFaucetByChainIDUseCase:           getFaucetByChainIDUseCase,
		userGetByFederatedIdentityIDUseCase: userGetByFederatedIdentityIDUseCase,
		fetchRemoteAccountBalanceFromAuthorityUseCase: fetchRemoteAccountBalanceFromAuthorityUseCase,
	}
}

func (svc *getDashboardServiceImpl) Execute(sessCtx mongo.SessionContext) (*DashboardDTO, error) {
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

	faucet, err := svc.getFaucetByChainIDUseCase.Execute(sessCtx, svc.config.Blockchain.ChainID)
	if err != nil {
		svc.logger.Error("failed getting faucet by chain id error", slog.Any("err", err))
		return nil, err
	}
	if faucet == nil {
		err := fmt.Errorf("faucet d.n.e. for chain ID: %v", svc.config.Blockchain.ChainID)
		svc.logger.Error("failed getting faucet by chain id error", slog.Any("err", err))
		return nil, err
	}
	user, err := svc.userGetByFederatedIdentityIDUseCase.Execute(sessCtx, federatedidentityID)
	if err != nil {
		svc.logger.Error("failed getting user error", slog.Any("err", err))
		return nil, err
	}

	//
	// Get remote records.
	//

	// Developers note: Remote server returns 404 error if account d.n.e. which is OK,
	// as a result, we will skip any errors here and only check if we get user
	// wallet balance response.
	var userWalletBalance uint64
	remoteAccount, _ := svc.fetchRemoteAccountBalanceFromAuthorityUseCase.Execute(sessCtx, user.WalletAddress)
	if remoteAccount != nil {
		userWalletBalance = remoteAccount.Balance
	}

	//
	// Return the results
	//

	// Special circumstance #1
	var canClaim bool
	if user.LastClaimTime.IsZero() || user.NextClaimTime.IsZero() {
		canClaim = true
	} else {
		canClaim = time.Now().After(user.NextClaimTime)
	}

	// Special circumstance #2
	if user.ClaimedCoinTransactions == nil {
		user.ClaimedCoinTransactions = make([]*dom_user.UserClaimedCoinTransaction, 0)
	}

	// Limit transactions to maximum of 5
	var limitedTransactions []*dom_user.UserClaimedCoinTransaction
	if len(user.ClaimedCoinTransactions) <= 5 {
		limitedTransactions = user.ClaimedCoinTransactions
	} else {
		limitedTransactions = user.ClaimedCoinTransactions[:5]
	}

	// Return our dashboard response.
	return &DashboardDTO{
		ChainID:                 faucet.ChainID,
		FaucetBalance:           faucet.Balance,
		UserBalance:             userWalletBalance,
		TotalCoinsClaimedByUser: user.TotalCoinsClaimed,
		Transactions:            limitedTransactions,
		LastModifiedAt:          faucet.LastModifiedAt,
		LastClaimTime:           user.LastClaimTime,
		NextClaimTime:           user.NextClaimTime,
		CanClaim:                canClaim,
		WalletAddress:           user.WalletAddress,
	}, nil
}
