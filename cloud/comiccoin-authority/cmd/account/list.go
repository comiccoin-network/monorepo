package account

import (
	"context"
	"log"
	"log/slog"

	"github.com/spf13/cobra"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/logger"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/storage/database/mongodb"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/repo"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/service"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase"
	uc_account "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/account"
)

func ListAccountCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "list",
		Short: "List all my accounts",
		Run: func(cmd *cobra.Command, args []string) {
			doRunListAccount()
		},
	}

	return cmd
}

func doRunListAccount() {
	// Common
	logger := logger.NewProvider()
	cfg := config.NewProvider()
	dbClient := mongodb.NewProvider(cfg, logger)

	// Repository
	walletRepo := repo.NewWalletRepo(cfg, logger, dbClient)
	accountRepo := repo.NewAccountRepo(cfg, logger, dbClient)

	// Use-case
	listAllAddressesWalletUseCase := usecase.NewListAllAddressesWalletUseCase(
		logger,
		walletRepo,
	)
	accountsFilterByAddressesUseCase := uc_account.NewAccountsFilterByAddressesUseCase(
		logger,
		accountRepo,
	)

	// Service
	accountListingByLocalWalletsService := service.NewAccountListingByLocalWalletsService(
		logger,
		listAllAddressesWalletUseCase,
		accountsFilterByAddressesUseCase,
	)

	////
	//// Start the transaction.
	////
	ctx := context.Background()

	session, err := dbClient.StartSession()
	if err != nil {
		logger.Error("start session error",
			slog.Any("error", err))
		log.Fatalf("Failed executing: %v\n", err)
	}
	defer session.EndSession(ctx)

	// Define a transaction function with a series of operations
	transactionFunc := func(sessCtx mongo.SessionContext) (interface{}, error) {

		accounts, err := accountListingByLocalWalletsService.Execute(sessCtx)
		if err != nil {
			return nil, err
		}
		return accounts, nil
	}

	// Start a transaction
	res, err := session.WithTransaction(ctx, transactionFunc)
	if err != nil {
		logger.Error("session failed error",
			slog.Any("error", err))
		log.Fatalf("Failed creating account: %v\n", err)
	}

	accounts := res.([]*domain.Account)

	for _, account := range accounts {
		logger.Debug("Local account retrieved",
			slog.Any("nonce", account.GetNonce()),
			slog.Uint64("balance", account.Balance),
			slog.String("address", account.Address.Hex()),
		)
	}
}
