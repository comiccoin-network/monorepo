package initialize

import (
	"context"
	"log"
	"log/slog"
	"time"

	"github.com/spf13/cobra"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/blockchain/hdkeystore"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/logger"
	passwordp "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/security/password"
	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/security/securestring"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/storage/database/mongodb"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/repo"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/service"
	uc_account "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/account"
	uc_tenant "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/tenant"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/user"
	uc_wallet "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/wallet"
	uc_walletutil "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/walletutil"
)

var (
	flagTenantName string
	flagChainID    uint16
	flagEmail      string
	flagMnemonic   string
	flagPath       string
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
	cmd.Flags().StringVar(&flagMnemonic, "wallet-mnemonic", "", "The mnemonic to derive our wallet with")
	cmd.MarkFlagRequired("wallet-mnemonic")
	cmd.Flags().StringVar(&flagPath, "wallet-path", "", "The path to apply in our wallet derivation process")
	cmd.MarkFlagRequired("wallet-path")

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
	keystore := hdkeystore.NewAdapter()
	passp := passwordp.NewProvider()
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

	// Wallet Utils
	openHDWalletFromMnemonicUseCase := uc_walletutil.NewOpenHDWalletFromMnemonicUseCase(
		cfg,
		logger,
		keystore,
	)
	privateKeyFromHDWalletUseCase := uc_walletutil.NewPrivateKeyFromHDWalletUseCase(
		cfg,
		logger,
		keystore,
	)

	// Wallet
	getWalletUseCase := uc_wallet.NewGetWalletUseCase(
		cfg,
		logger,
		walletRepo,
	)
	_ = getWalletUseCase
	createWalletUseCase := uc_wallet.NewCreateWalletUseCase(
		cfg,
		logger,
		walletRepo,
	)

	// Tenant
	tenantGetByNameUseCase := uc_tenant.NewTenantGetByNameUseCase(
		cfg,
		logger,
		tenantRepo,
	)
	tenantCreate := uc_tenant.NewTenantCreateUseCase(
		cfg,
		logger,
		tenantRepo,
	)

	// User
	userGetByEmailUseCase := uc_user.NewUserGetByEmailUseCase(
		cfg,
		logger,
		userRepo,
	)
	userCreateUseCase := uc_user.NewUserCreateUseCase(
		cfg,
		logger,
		userRepo,
	)

	// Account
	getAccountUseCase := uc_account.NewGetAccountUseCase(
		logger,
		accountRepo,
	)
	createAccountUseCase := uc_account.NewCreateAccountUseCase(
		cfg,
		logger,
		accountRepo,
	)

	//
	// Service
	//

	createAccountService := service.NewCreateAccountService(
		logger,
		openHDWalletFromMnemonicUseCase,
		privateKeyFromHDWalletUseCase,
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
	mnemonic, err := sstring.NewSecureString(flagMnemonic)
	if err != nil {
		log.Fatalf("Failed securing flagMnemonic: %v\n", err)
	}
	// defer mnemonic.Wipe() // Developers Note: Commented out b/c they are causing the hang in the program to exit?

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
		err := initService.Execute(sessCtx, flagTenantName, flagChainID, flagEmail, mnemonic, flagPath)
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
