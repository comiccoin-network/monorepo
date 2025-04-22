package account

import (
	"context"
	"errors"
	"log"
	"log/slog"
	"time"

	"github.com/spf13/cobra"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/domain"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/repo"
	s_account "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/service/account"
	uc_account "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/account"
	uc_wallet "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/wallet"
	uc_walletutil "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/walletutil"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/blockchain/hdkeystore"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/logger"
	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/securestring"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/storage/database/mongodb"
)

func NewAccountCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "new",
		Short: "Creates a new wallet in our ComicCoin node local filesystem and encrypts it with the inputted password",
		Run: func(cmd *cobra.Command, args []string) {
			doRunNewAccount()
		},
	}

	cmd.Flags().StringVar(&flagMnemonic, "wallet-mnemonic", "", "The mnemonic phrase to derive the new wallet from")
	cmd.MarkFlagRequired("wallet-mnemonic")
	cmd.Flags().StringVar(&flagPath, "wallet-path", "m/44'/60'/0'/0/0", "The path to use when deriving the wallet from the mnemonic phrase")
	cmd.MarkFlagRequired("wallet-path")
	cmd.Flags().StringVar(&flagLabel, "wallet-label", "", "The (optional) label to describe the new wallet with")

	return cmd
}

func doRunNewAccount() {
	// Common
	logger := logger.NewProvider()
	cfg := config.NewProvider()
	dbClient := mongodb.NewProvider(cfg, logger)
	hdkeystore := hdkeystore.NewAdapter()

	// Repository
	walletRepo := repo.NewWalletRepo(cfg, logger, dbClient)
	accountRepo := repo.NewAccountRepo(cfg, logger, dbClient)

	// Use-case
	openHDWalletFromMnemonicUseCase := uc_walletutil.NewOpenHDWalletFromMnemonicUseCase(
		cfg,
		logger,
		hdkeystore,
	)
	privateKeyFromHDWalletUseCase := uc_walletutil.NewPrivateKeyFromHDWalletUseCase(
		cfg,
		logger,
		hdkeystore,
	)
	createWalletUseCase := uc_wallet.NewCreateWalletUseCase(
		cfg,
		logger,
		walletRepo,
	)
	createAccountUseCase := uc_account.NewCreateAccountUseCase(
		cfg,
		logger,
		accountRepo,
	)
	getAccountUseCase := uc_account.NewGetAccountUseCase(
		cfg,
		logger,
		accountRepo,
	)

	// Service
	createAccountService := s_account.NewCreateAccountService(
		cfg,
		logger,
		openHDWalletFromMnemonicUseCase,
		privateKeyFromHDWalletUseCase,
		createWalletUseCase,
		createAccountUseCase,
		getAccountUseCase,
	)

	// Minor formatting of input.
	mnemonic, err := sstring.NewSecureString(flagMnemonic)
	if err != nil {
		log.Fatalf("Failed securing: %v\n", err)
	}
	defer mnemonic.Wipe()

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

	logger.Debug("Starting MongoDB transaction...")

	// Define a transaction function with a series of operations
	transactionFunc := func(sessCtx mongo.SessionContext) (interface{}, error) {
		logger.Debug("Transaction started")

		// Execution
		account, err := createAccountService.Execute(sessCtx, mnemonic, flagPath, flagLabel)
		if err != nil {
			logger.Error("Failed creating account",
				slog.Any("error", err))
			sessCtx.AbortTransaction(ctx)
			return nil, err
		}
		if account == nil {
			err := errors.New("Account does not exist")
			logger.Error("Failed creating account",
				slog.Any("error", err))
			sessCtx.AbortTransaction(ctx)
			return nil, err
		}

		logger.Debug("Committing transaction")
		if err := sessCtx.CommitTransaction(ctx); err != nil {
			logger.Error("Commit error",
				slog.Any("error", err))
			return nil, err
		}
		logger.Debug("Transaction committed")

		return account, nil
	}
	res, err := session.WithTransaction(ctx, transactionFunc)
	logger.Debug("Finished mongodb transaction") //HELP: WHY DOES THE CODE NEVER GET HERE?
	if err != nil {
		logger.Error("session failed error",
			slog.Any("error", err))
		log.Fatalf("Failed creating account: %v\n", err)
	}

	account := res.(*domain.Account)

	logger.Debug("Account created",
		slog.Any("nonce", account.GetNonce()),
		slog.Uint64("balance", account.Balance),
		slog.String("address", account.Address.Hex()),
	)
}
