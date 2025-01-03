package account

import (
	"context"
	"errors"
	"log"
	"log/slog"
	"strings"

	"github.com/ethereum/go-ethereum/common"
	"github.com/spf13/cobra"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/logger"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/storage/database/mongodb"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/repo"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/service"
	uc_account "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/account"
)

func GetAccountCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "get",
		Short: "Get account details",
		Run: func(cmd *cobra.Command, args []string) {
			doRunGetAccount()
		},
	}

	cmd.Flags().StringVar(&flagAccountAddress, "address", "", "The address value to lookup the account by")
	cmd.MarkFlagRequired("address")

	return cmd
}

func doRunGetAccount() {
	// Common
	logger := logger.NewProvider()
	cfg := config.NewProvider()
	dbClient := mongodb.NewProvider(cfg, logger)

	// Repository
	accountRepo := repo.NewAccountRepo(cfg, logger, dbClient)

	// Use-case
	getAccountUseCase := uc_account.NewGetAccountUseCase(
		cfg,
		logger,
		accountRepo,
	)

	// Service
	getAccountService := service.NewGetAccountService(
		logger,
		getAccountUseCase,
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

	logger.Debug("Getting account...",
		slog.Any("account_address", flagAccountAddress))

	// Define a transaction function with a series of operations
	transactionFunc := func(sessCtx mongo.SessionContext) (interface{}, error) {
		accountAddress := common.HexToAddress(strings.ToLower(flagAccountAddress))

		account, err := getAccountService.Execute(sessCtx, &accountAddress)
		if err != nil {
			return nil, err
		}
		if account == nil {
			err := errors.New("Account does not exist")
			return nil, err
		}

		return account, nil
	}

	// Start a transaction
	res, err := session.WithTransaction(ctx, transactionFunc)
	if err != nil {
		logger.Error("session failed error",
			slog.Any("error", err))
		log.Fatalf("Failed getting account: %v\n", err)
	}

	account := res.(*domain.Account)

	logger.Debug("Account retrieved",
		slog.Any("nonce", account.GetNonce()),
		slog.Uint64("balance", account.Balance),
		slog.String("address", account.Address.Hex()),
	)
}
