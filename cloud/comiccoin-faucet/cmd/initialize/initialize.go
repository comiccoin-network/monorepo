package initialize

import (
	"context"
	"log"
	"log/slog"
	"time"

	"github.com/spf13/cobra"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/blockchain/keystore"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/logger"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/security/password"
	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/security/securestring"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/storage/database/mongodb"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/repo"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/service"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase"
)

var (
	flagTenantName       string
	flagChainID          uint16
	flagEmail            string
	flagPassword         string
	flagPasswordRepeated string
)

func InitCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "init",
		Short: "Initialize the application",
		Run: func(cmd *cobra.Command, args []string) {
			doRunGatewayInit()
		},
	}
	cmd.Flags().StringVar(&flagTenantName, "tenant-name", "", "The name of the tenant organization")
	cmd.MarkFlagRequired("tenant-name")
	cmd.Flags().Uint16Var(&flagChainID, "chain-id", 0, "The blockchain unique id")
	cmd.MarkFlagRequired("chain-id")
	cmd.Flags().StringVar(&flagEmail, "email", "", "The email of the administrator")
	cmd.MarkFlagRequired("email")
	cmd.Flags().StringVar(&flagPassword, "wallet-password", "", "The password to encrypt the new wallet with")
	cmd.MarkFlagRequired("wallet-password")
	cmd.Flags().StringVar(&flagPasswordRepeated, "wallet-password-repeated", "", "The password repeated to verify your password is correct")
	cmd.MarkFlagRequired("wallet-password-repeated")

	return cmd
}

func doRunGatewayInit() {
	//
	// STEP 1
	// Load up our dependencies and configuration
	//

	// Common
	logger := logger.NewProvider()
	// kmutex := kmutexutil.NewKMutexProvider()
	cfg := config.NewProviderUsingEnvironmentVariables()
	dbClient := mongodb.NewProvider(cfg, logger)
	keystore := keystore.NewAdapter()
	passp := password.NewProvider()
	// blackp := blacklist.NewProvider()

	//
	// Repository
	//

	tenantRepo := repo.NewTenantRepository(cfg, logger, dbClient)
	userRepo := repo.NewUserRepository(cfg, logger, dbClient)
	walletRepo := repo.NewWalletRepository(cfg, logger, dbClient)
	accountRepo := repo.NewAccountRepository(cfg, logger, dbClient)

	//
	// Use-case
	//

	// Wallet
	walletDecryptKeyUseCase := usecase.NewWalletDecryptKeyUseCase(
		cfg,
		logger,
		keystore,
		walletRepo,
	)
	walletEncryptKeyUseCase := usecase.NewWalletEncryptKeyUseCase(
		cfg,
		logger,
		keystore,
		walletRepo,
	)
	getWalletUseCase := usecase.NewGetWalletUseCase(
		cfg,
		logger,
		walletRepo,
	)
	_ = getWalletUseCase
	createWalletUseCase := usecase.NewCreateWalletUseCase(
		cfg,
		logger,
		walletRepo,
	)

	// Tenant
	tenantGetByNameUseCase := usecase.NewTenantGetByNameUseCase(
		cfg,
		logger,
		tenantRepo,
	)
	tenantCreate := usecase.NewTenantCreateUseCase(
		cfg,
		logger,
		tenantRepo,
	)

	// User
	userGetByEmailUseCase := usecase.NewUserGetByEmailUseCase(
		cfg,
		logger,
		userRepo,
	)
	userCreateUseCase := usecase.NewUserCreateUseCase(
		cfg,
		logger,
		userRepo,
	)

	// Account
	getAccountUseCase := usecase.NewGetAccountUseCase(
		logger,
		accountRepo,
	)
	createAccountUseCase := usecase.NewCreateAccountUseCase(
		cfg,
		logger,
		accountRepo,
	)

	//
	// Service
	//

	createAccountService := service.NewCreateAccountService(
		logger,
		walletEncryptKeyUseCase,
		walletDecryptKeyUseCase,
		createWalletUseCase,
		createAccountUseCase,
		getAccountUseCase,
	)

	initService := service.NewGatewayInitService(
		cfg,
		logger,
		passp,
		createAccountService,
		tenantGetByNameUseCase,
		tenantCreate,
		userGetByEmailUseCase,
		userCreateUseCase,
	)

	//
	// Interface.
	//

	// (Nothing...)

	//
	// Execute.
	//

	// Minor formatting of input.
	pass, err := sstring.NewSecureString(flagPassword)
	if err != nil {
		log.Fatalf("Failed securing flagPassword: %v\n", err)
	}
	// defer pass.Wipe() // Developers Note: Commented out b/c they are causing the hang in the program to exit?
	passRepeated, err := sstring.NewSecureString(flagPasswordRepeated)
	if err != nil {
		log.Fatalf("Failed securing flagPasswordRepeated: %v\n", err)
	}
	// defer passRepeated.Wipe() // Developers Note: Commented out b/c they are causing the hang in the program to exit?

	////
	//// Start the transaction.
	////

	// Create context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	session, err := dbClient.StartSession()
	if err != nil {
		logger.Error("start session error",
			slog.Any("error", err))
		log.Fatalf("Failed executing: %v\n", err)
	}
	defer session.EndSession(ctx)

	// Define a transaction function with a series of operations
	transactionFunc := func(sessCtx mongo.SessionContext) (interface{}, error) {
		logger.Debug("Transaction started")
		err := initService.Execute(sessCtx, flagTenantName, flagChainID, flagEmail, pass, passRepeated)
		if err != nil {
			return nil, err
		}

		logger.Debug("Committing transaction")
		if err := sessCtx.CommitTransaction(ctx); err != nil {
			return nil, err
		}
		logger.Debug("Transaction committed")

		return nil, nil
	}

	// Start a transaction
	if _, err := session.WithTransaction(ctx, transactionFunc); err != nil {
		logger.Error("session failed error",
			slog.Any("error", err))
		log.Fatalf("Failed creating account: %v\n", err)
	}
}
