// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/service/faucet/updatebalance.go
package getFaucet

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	uc_faucet "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/usecase/faucet"
	uc_remoteaccountbalance "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/usecase/remoteaccountbalance"
)

type UpdateFaucetBalanceByAuthorityService interface {
	ExecuteByChainID(ctx context.Context) (*FaucetDTO, error)
}

type updateFaucetBalanceByAuthorityImpl struct {
	config                                        *config.Configuration
	logger                                        *slog.Logger
	getFaucetByChainIDUseCase                     uc_faucet.GetFaucetByChainIDUseCase
	fetchRemoteAccountBalanceFromAuthorityUseCase uc_remoteaccountbalance.FetchRemoteAccountBalanceFromAuthorityUseCase
	faucetUpdateByChainIDUseCase                  uc_faucet.FaucetUpdateByChainIDUseCase
}

func NewUpdateFaucetBalanceByAuthorityService(
	config *config.Configuration,
	logger *slog.Logger,
	getFaucetByChainIDUseCase uc_faucet.GetFaucetByChainIDUseCase,
	fetchRemoteAccountBalanceFromAuthorityUseCase uc_remoteaccountbalance.FetchRemoteAccountBalanceFromAuthorityUseCase,
	faucetUpdateByChainIDUseCase uc_faucet.FaucetUpdateByChainIDUseCase,
) UpdateFaucetBalanceByAuthorityService {
	return &updateFaucetBalanceByAuthorityImpl{
		config:                    config,
		logger:                    logger,
		getFaucetByChainIDUseCase: getFaucetByChainIDUseCase,
		fetchRemoteAccountBalanceFromAuthorityUseCase: fetchRemoteAccountBalanceFromAuthorityUseCase,
		faucetUpdateByChainIDUseCase:                  faucetUpdateByChainIDUseCase,
	}
}

func (svc *updateFaucetBalanceByAuthorityImpl) ExecuteByChainID(ctx context.Context) (*FaucetDTO, error) {
	//
	// STEP 1: Get from database.
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

	//
	// STEP 2: Get account balance from the Authority.
	//

	remoteAccountBalance, err := svc.fetchRemoteAccountBalanceFromAuthorityUseCase.Execute(ctx, svc.config.Blockchain.PublicFaucetAccountAddress)
	if err != nil {
		svc.logger.Error("failed getting balance from authority error", slog.Any("err", err))
		return nil, err
	}
	if remoteAccountBalance == nil {
		err := fmt.Errorf("balance d.n.e. for address: %v", svc.config.Blockchain.PublicFaucetAccountAddress)
		svc.logger.Error("failed getting faucet by chain id error", slog.Any("err", err))
		return nil, err
	}

	//
	// STEP 3: Update database record.
	//

	if faucet.Balance != remoteAccountBalance.Balance {
		faucet.Balance = remoteAccountBalance.Balance
		faucet.LastModifiedAt = time.Now()
		err := svc.faucetUpdateByChainIDUseCase.Execute(ctx, faucet)
		if err != nil {
			svc.logger.Error("failed updating", slog.Any("err", err))
			return nil, err
		}
	}

	//
	// STEP 4: Format to DTO
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
	}, nil
}
