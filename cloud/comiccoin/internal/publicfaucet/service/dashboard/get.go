// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/service/faucet/getbychainid.go
package dashboard

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"math/big"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	uc_faucet "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/usecase/faucet"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/usecase/user"
)

type TransactionDTO struct {
	ChainID       uint16   `bson:"chain_id" json:"chain_id"`
	FaucetBalance *big.Int `bson:"faucet_balance" json:"faucet_balance"`
}

type DashboardDTO struct {
	ChainID           uint16            `bson:"chain_id" json:"chain_id"`
	FaucetBalance     *big.Int          `bson:"faucet_balance" json:"faucet_balance"`
	UserBalance       *big.Int          `bson:"user_balance" json:"user_balance"`
	TotalCoinsClaimed *big.Int          `bson:"total_coins_claimed" json:"total_coins_claimed"`
	Transactions      []*TransactionDTO `bson:"transactions" json:"transactions"`
	LastModifiedAt    time.Time         `bson:"last_modified_at,omitempty" json:"last_modified_at,omitempty"`
}

type GetDashboardService interface {
	Execute(ctx context.Context) (*DashboardDTO, error)
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

func (svc *getDashboardServiceImpl) Execute(ctx context.Context) (*DashboardDTO, error) {
	// Get authenticated federatedidentity ID from context. This is loaded in
	// by the `AuthMiddleware` found via:
	// - github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/interface/http/middleware/auth.go
	federatedidentityID, ok := ctx.Value("federatedidentity_id").(primitive.ObjectID)
	if !ok {
		svc.logger.Error("Failed getting local federatedidentity id",
			slog.Any("error", "Not found in context: federatedidentity_id"))
		return nil, errors.New("federatedidentity not found in context")
	}

	//
	// Get related records.
	//

	faucet, err := svc.getFaucetByChainIDUseCase.Execute(ctx, svc.config.Blockchain.ChainID)
	if err != nil {
		svc.logger.Error("failed getting faucet by chain id error", slog.Any("err", err))
		return nil, err
	}
	if faucet == nil {
		err := fmt.Errorf("faucet d.n.e. for chain ID: %v", svc.config.Blockchain.ChainID)
		svc.logger.Error("failed getting faucet by chain id error", slog.Any("err", err))
		return nil, err
	}
	user, err := svc.userGetByFederatedIdentityIDUseCase.Execute(ctx, federatedidentityID)
	if err != nil {
		svc.logger.Error("failed getting user error", slog.Any("err", err))
		return nil, err
	}

	_ = user

	txs := make([]*TransactionDTO, 0)

	//
	// Return the results
	//

	return &DashboardDTO{
		ChainID: faucet.ChainID,
		// FaucetBalance:     faucet.FaucetBalance,
		// UserBalance:       faucet.UserBalance,
		// TotalCoinsClaimed: faucet.TotalCoinsClaimed,
		Transactions:   txs,
		LastModifiedAt: faucet.LastModifiedAt,
	}, nil
}
