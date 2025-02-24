// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/service/faucet/getbychainid.go
package faucet

import (
	"fmt"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	uc_faucet "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/usecase/faucet"
)

type FaucetDTO struct {
	ChainID                    uint16    `bson:"chain_id" json:"chain_id"`
	Balance                    uint64    `bson:"balance" json:"balance"`
	UsersCount                 uint64    `bson:"users_count" json:"users_count"`
	TotalCoinsDistributed      uint64    `bson:"total_coins_distributed" json:"total_coins_distributed"`
	TotalTransactions          uint64    `bson:"total_transactions" json:"total_transactions"`
	DistributationRatePerDay   uint64    `bson:"distribution_rate_per_day" json:"distribution_rate_per_day"`
	TotalCoinsDistributedToday uint64    `bson:"total_coins_distributed_today" json:"total_coins_distributed_today"`
	TotalTransactionsToday     uint64    `bson:"total_transactions_today" json:"total_transactions_today"`
	CreatedAt                  time.Time `bson:"created_at,omitempty" json:"created_at,omitempty"`
	LastModifiedAt             time.Time `bson:"last_modified_at,omitempty" json:"last_modified_at,omitempty"`
	DailyCoinsReward           uint64    `bson:"daily_coins_reward" json:"daily_coins_reward"`
}

type GetFaucetService interface {
	ExecuteByChainID(sessCtx mongo.SessionContext, chainID uint16) (*FaucetDTO, error)
}

type getFaucetServiceImpl struct {
	config                    *config.Configuration
	logger                    *slog.Logger
	getFaucetByChainIDUseCase uc_faucet.GetFaucetByChainIDUseCase
}

func NewGetFaucetService(
	config *config.Configuration,
	logger *slog.Logger,
	getFaucetByChainIDUseCase uc_faucet.GetFaucetByChainIDUseCase,
) GetFaucetService {
	return &getFaucetServiceImpl{
		config:                    config,
		logger:                    logger,
		getFaucetByChainIDUseCase: getFaucetByChainIDUseCase,
	}
}

func (svc *getFaucetServiceImpl) ExecuteByChainID(sessCtx mongo.SessionContext, chainID uint16) (*FaucetDTO, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if chainID == 0 {
		e["chain_id"] = "Chain ID is required"
	}
	if len(e) != 0 {
		svc.logger.Warn("Failed validating",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Get from database.
	//

	faucet, err := svc.getFaucetByChainIDUseCase.Execute(sessCtx, chainID)
	if err != nil {
		svc.logger.Error("failed getting faucet by chain id error", slog.Any("err", err))
		return nil, err
	}
	if faucet == nil {
		err := fmt.Errorf("faucet d.n.e. for chain ID: %v", chainID)
		svc.logger.Error("failed getting faucet by chain id error", slog.Any("err", err))
		return nil, err
	}

	//
	// STEP 3: Format to DTO
	//

	return &FaucetDTO{
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
		DailyCoinsReward:           svc.config.Blockchain.PublicFaucetClaimCoinsReward,
	}, nil
}
