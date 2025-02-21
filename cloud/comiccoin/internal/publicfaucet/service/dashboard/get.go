// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/service/faucet/getbychainid.go
package dashboard

import (
	"errors"
	"fmt"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	uc_faucet "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/usecase/faucet"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/usecase/user"
)

type TransactionDTO struct {
	ChainID       uint16 `bson:"chain_id" json:"chain_id"`
	FaucetBalance uint64 `bson:"faucet_balance" json:"faucet_balance"`
}

type DashboardDTO struct {
	ChainID                 uint16            `bson:"chain_id" json:"chain_id"`
	FaucetBalance           uint64            `bson:"faucet_balance" json:"faucet_balance"`
	UserBalance             uint64            `bson:"user_balance" json:"user_balance"`
	TotalCoinsClaimedByUser uint64            `bson:"total_coins_claimed_by_user" json:"total_coins_claimed"`
	Transactions            []*TransactionDTO `bson:"transactions" json:"transactions"`
	LastModifiedAt          time.Time         `bson:"last_modified_at,omitempty" json:"last_modified_at,omitempty"`

	LastClaimTime time.Time `bson:"last_claim_time" json:"last_claim_time"`
	NextClaimTime time.Time `bson:"next_claim_time" json:"next_claim_time"`
	CanClaim      bool      `bson:"can_claim" json:"can_claim"`
}

type GetDashboardService interface {
	Execute(sessCtx mongo.SessionContext) (*DashboardDTO, error)
}

type getDashboardServiceImpl struct {
	config                              *config.Configuration
	logger                              *slog.Logger
	getFaucetByChainIDUseCase           uc_faucet.GetFaucetByChainIDUseCase
	userGetByFederatedIdentityIDUseCase uc_user.UserGetByFederatedIdentityIDUseCase
}

func NewGetDashboardService(
	config *config.Configuration,
	logger *slog.Logger,
	getFaucetByChainIDUseCase uc_faucet.GetFaucetByChainIDUseCase,
	userGetByFederatedIdentityIDUseCase uc_user.UserGetByFederatedIdentityIDUseCase,
) GetDashboardService {
	return &getDashboardServiceImpl{
		config:                              config,
		logger:                              logger,
		getFaucetByChainIDUseCase:           getFaucetByChainIDUseCase,
		userGetByFederatedIdentityIDUseCase: userGetByFederatedIdentityIDUseCase,
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

	_ = user

	txs := make([]*TransactionDTO, 0)

	// // For example purposes, let's set some hard-coded values
	// now := time.Now()
	// lastClaimTime := now.Add(-20 * time.Hour)          // Assuming user claimed 20 hours ago
	// nextClaimTime := lastClaimTime.Add(24 * time.Hour) // Next claim is 24 hours after last claim
	// canClaim := now.After(nextClaimTime)

	//
	// Return the results
	//

	// Special circumstances
	var canClaim bool
	if user.LastClaimTime.IsZero() || user.NextClaimTime.IsZero() {
		canClaim = true
	} else {
		canClaim = time.Now().After(user.NextClaimTime)
	}

	svc.logger.Debug("execution finished")

	return &DashboardDTO{
		ChainID:                 faucet.ChainID,
		FaucetBalance:           0,
		UserBalance:             0,
		TotalCoinsClaimedByUser: 0,
		Transactions:            txs,
		LastModifiedAt:          faucet.LastModifiedAt,
		LastClaimTime:           user.LastClaimTime,
		NextClaimTime:           user.NextClaimTime,
		CanClaim:                canClaim,
		// LastClaimTime: lastClaimTime,
		// NextClaimTime: nextClaimTime,
		// CanClaim:      canClaim,
	}, nil
}
