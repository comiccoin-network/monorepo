package publicfaucet

import (
	"context"
	"fmt"
	"log"
	"log/slog"

	"github.com/spf13/cobra"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/logger"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/storage/database/mongodb"
	dom_faucet "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/domain/faucet"
	r_faucet "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/repo/faucet"
	r_remoteaccountbalance "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/repo/remoteaccountbalance"
	svc_faucet "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/service/faucet"
	uc_faucet "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/usecase/faucet"
	uc_remoteaccountbalance "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/usecase/remoteaccountbalance"
)

// Usage:
// go run main.go publicfaucet update-faucet-balance

func GetUpdateFaucetBalanceCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "update-faucet-balance",
		Short: "Update faucet balance from remote authority",
		Run: func(cmd *cobra.Command, args []string) {
			doRunUpdateFaucetBalance()
		},
	}
	return cmd
}

func doRunUpdateFaucetBalance() {
	// Common
	logger := logger.NewProvider()
	cfg := config.NewProvider()
	dbClient := mongodb.NewProvider(cfg, logger)

	// Repositories
	faucetRepo := r_faucet.NewRepository(cfg, logger, dbClient)
	remoteAccountBalanceRepo := r_remoteaccountbalance.NewRepository(cfg, logger)

	// Use-cases
	getFaucetByChainIDUseCase := uc_faucet.NewGetFaucetByChainIDUseCase(
		cfg,
		logger,
		faucetRepo,
	)
	fetchRemoteAccountBalanceFromAuthorityUseCase := uc_remoteaccountbalance.NewFetchRemoteAccountBalanceFromAuthorityUseCase(
		logger,
		remoteAccountBalanceRepo,
	)
	faucetUpdateByChainIDUseCase := uc_faucet.NewFaucetUpdateByChainIDUseCase(
		cfg,
		logger,
		faucetRepo,
	)

	// Service
	updateFaucetBalanceByAuthorityService := svc_faucet.NewUpdateFaucetBalanceByAuthorityService(
		cfg,
		logger,
		getFaucetByChainIDUseCase,
		fetchRemoteAccountBalanceFromAuthorityUseCase,
		faucetUpdateByChainIDUseCase,
	)

	// Start the transaction
	ctx := context.Background()
	session, err := dbClient.StartSession()
	if err != nil {
		logger.Error("start session error",
			slog.Any("error", err))
		log.Fatalf("Failed executing: %v\n", err)
	}
	defer session.EndSession(ctx)

	logger.Info("Updating faucet balance from remote authority...")

	// Define a transaction function with a series of operations
	transactionFunc := func(sessCtx mongo.SessionContext) (interface{}, error) {
		err := updateFaucetBalanceByAuthorityService.Execute(sessCtx)
		if err != nil {
			return nil, err
		}

		// Get updated faucet to display the new balance
		faucet, err := getFaucetByChainIDUseCase.Execute(sessCtx, cfg.Blockchain.ChainID)
		if err != nil {
			return nil, err
		}
		return faucet, nil
	}

	// Start a transaction
	result, err := session.WithTransaction(ctx, transactionFunc)
	if err != nil {
		logger.Error("session failed error",
			slog.Any("error", err))
		log.Fatalf("Failed updating faucet balance: %v\n", err)
	}

	if updatedFaucet, ok := result.(*dom_faucet.Faucet); ok {
		fmt.Printf("Faucet balance updated successfully:\n")
		fmt.Printf("  Chain ID: %d\n", updatedFaucet.ChainID)
		fmt.Printf("  Balance: %d\n", updatedFaucet.Balance)
		fmt.Printf("  Last Modified: %s\n", updatedFaucet.LastModifiedAt.Format("2006-01-02 15:04:05"))
	}

	logger.Info("Faucet balance updated successfully")
}
