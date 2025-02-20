// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/service/faucet/getbychainid.go
package dashboard

import (
	"context"
	"fmt"
	"log/slog"
	"math/big"
	"time"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	uc_faucet "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/usecase/faucet"
)

type DashboardDTO struct {
	ChainID                    uint16    `bson:"chain_id" json:"chain_id"`
	Balance                    *big.Int  `bson:"balance" json:"balance"`
	UsersCount                 uint16    `bson:"users_count" json:"users_count"`
	TotalCoinsDistributed      *big.Int  `bson:"total_coins_distributed" json:"total_coins_distributed"`
	TotalTransactions          uint16    `bson:"total_transactions" json:"total_transactions"`
	DistributationRatePerDay   uint16    `bson:"distribution_rate_per_day" json:"distribution_rate_per_day"`
	TotalCoinsDistributedToday uint16    `bson:"total_coins_distributed_today" json:"total_coins_distributed_today"`
	TotalTransactionsToday     uint16    `bson:"total_transactions_today" json:"total_transactions_today"`
	CreatedAt                  time.Time `bson:"created_at,omitempty" json:"created_at,omitempty"`
	LastModifiedAt             time.Time `bson:"last_modified_at,omitempty" json:"last_modified_at,omitempty"`
}

type GetDashboardService interface {
	Execute(ctx context.Context) (*DashboardDTO, error)
}

type getDashboardServiceImpl struct {
	config           *config.Configuration
	logger           *slog.Logger
	getFaucetUseCase uc_faucet.GetDashboardByChainIDUseCase
}

func NewGetDashboardService(
	config *config.Configuration,
	logger *slog.Logger,
	getFaucetByChainIDUseCase uc_faucet.GetFaucetByChainIDUseCase,
) GetDashboardService {
	return &getDashboardServiceImpl{
		config:                    config,
		logger:                    logger,
		getFaucetByChainIDUseCase: getFaucetByChainIDUseCase,
	}
}

func (svc *getDashboardServiceImpl) Execute(ctx context.Context) (*DashboardDTO, error) {
	//
	// STEP 2: Get from database.
	//

	faucet, err := svc.getFaucetByChainIDUseCase.Execute(ctx, config.Blockchain.ChainID)
	if err != nil {
		svc.logger.Error("failed getting faucet by chain id error", slog.Any("err", err))
		return nil, err
	}
	if faucet == nil {
		err := fmt.Errorf("faucet d.n.e. for chain ID: %v", config.Blockchain.ChainID)
		svc.logger.Error("failed getting faucet by chain id error", slog.Any("err", err))
		return nil, err
	}

	//
	// STEP 3: Format to DTO
	//

	return &DashboardDTO{
		ChainID:                    faucet.ChainID,
		Balance:                    faucet.Balance,
		UsersCount:                 faucet.UsersCount,
		TotalCoinsDistributed:      faucet.TotalCoinsDistributed,
		TotalTransactions:          faucet.DistributationRatePerDay,
		DistributationRatePerDay:   faucet.DistributationRatePerDay,
		TotalCoinsDistributedToday: faucet.TotalCoinsDistributedToday,
		TotalTransactionsToday:     faucet.TotalTransactionsToday,
		CreatedAt:                  faucet.CreatedAt,
		LastModifiedAt:             faucet.LastModifiedAt,
	}, nil
}
