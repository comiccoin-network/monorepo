// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/nameservice/service/faucet/updatebalance.go
package faucet

import (
	"fmt"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	uc_faucet "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/nameservice/usecase/faucet"
	uc_remoteaccountbalance "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/nameservice/usecase/remoteaccountbalance"
)

type UpdateFaucetBalanceByAuthorityService interface {
	Execute(sessCtx mongo.SessionContext) error
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

func (svc *updateFaucetBalanceByAuthorityImpl) Execute(sessCtx mongo.SessionContext) error {
	//
	// STEP 1: Get from database.
	//

	faucet, err := svc.getFaucetByChainIDUseCase.Execute(sessCtx, svc.config.Blockchain.ChainID)
	if err != nil {
		svc.logger.Error("failed getting faucet by chain id error", slog.Any("err", err))
		return err
	}
	if faucet == nil {
		err := fmt.Errorf("faucet d.n.e. for chain ID: %v", svc.config.Blockchain.ChainID)
		svc.logger.Error("failed getting faucet by chain id error", slog.Any("err", err))
		return err
	}

	//
	// STEP 2: Get account balance from the Authority.
	//

	remoteAccountBalance, err := svc.fetchRemoteAccountBalanceFromAuthorityUseCase.Execute(sessCtx, svc.config.Blockchain.NameServiceAccountAddress)
	if err != nil {
		svc.logger.Error("failed getting balance from authority error",
			slog.Any("address", svc.config.Blockchain.NameServiceAccountAddress),
			slog.Any("err", err))
		return err
	}
	if remoteAccountBalance == nil {
		err := fmt.Errorf("balance d.n.e. for address: %v", svc.config.Blockchain.NameServiceAccountAddress)
		svc.logger.Error("failed getting balance from authority error", slog.Any("err", err))
		return err
	}

	//
	// STEP 3: Update database record.
	//

	if faucet.Balance != remoteAccountBalance.Balance {
		faucet.Balance = remoteAccountBalance.Balance
		faucet.LastModifiedAt = time.Now()
		err := svc.faucetUpdateByChainIDUseCase.Execute(sessCtx, faucet)
		if err != nil {
			svc.logger.Error("failed updating", slog.Any("err", err))
			return err
		}
	}

	//
	// STEP 4: Format to DTO
	//

	return nil
}
