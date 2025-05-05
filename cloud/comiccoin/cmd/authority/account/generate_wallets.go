package account

import (
	"context"
	"encoding/csv"
	"fmt"
	"log"
	"log/slog"
	"os"
	"time"

	"github.com/ethereum/go-ethereum/common"
	"github.com/spf13/cobra"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/domain"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/repo"
	s_account "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/service/account"
	sv_coin "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/service/coin"
	sv_poa "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/service/poa"
	uc_account "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/account"
	uc_blockchainstate "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/blockchainstate"
	uc_blockdata "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/blockdata"
	uc_genesisblockdata "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/genesisblockdata"
	uc_mempooltx "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/mempooltx"
	uc_pow "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/pow"
	uc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/token"
	uc_wallet "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/wallet"
	uc_walletutil "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/walletutil"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/blockchain/hdkeystore"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/distributedmutex"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/logger"
	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/securestring"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/storage/database/mongodb"
	cache "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/storage/memory/redis"
)

// example:
// ./comiccoin authority account generate-wallets --num-wallets=2 --coins-per-wallet=10 --output-file=my_wallets_v1.csv

var (
	flagNumWallets     int
	flagCoinsPerWallet uint64
	flagOutputFile     string
)

type WalletDetails struct {
	Address  string
	Mnemonic string
	Path     string
	Balance  uint64
}

func GenerateWalletsCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "generate-wallets",
		Short: "Generate multiple wallets and fund them with ComicCoins",
		Run: func(cmd *cobra.Command, args []string) {
			doRunGenerateWallets()
		},
	}

	cmd.Flags().IntVar(&flagNumWallets, "num-wallets", 5, "Number of wallets to generate")
	cmd.Flags().Uint64Var(&flagCoinsPerWallet, "coins-per-wallet", 100, "Amount of ComicCoins to add to each wallet")
	cmd.Flags().StringVar(&flagOutputFile, "output-file", "wallets.csv", "Output CSV file path")
	cmd.Flags().StringVar(&flagPath, "wallet-path", "m/44'/60'/0'/0/0", "The derivation path to use for all wallets")

	return cmd
}

func doRunGenerateWallets() {
	// Common
	logger := logger.NewProvider()
	cfg := config.NewProvider()
	dbClient := mongodb.NewProvider(cfg, logger)
	keystore := hdkeystore.NewAdapter()
	redisCacheProvider := cache.NewCache(cfg, logger)
	dmutex := distributedmutex.NewAdapter(logger, redisCacheProvider.GetRedisClient())

	// Repository
	walletRepo := repo.NewWalletRepo(cfg, logger, dbClient)
	accountRepo := repo.NewAccountRepo(cfg, logger, dbClient)
	mempoolTxRepo := repo.NewMempoolTransactionRepo(cfg, logger, dbClient)
	blockchainStateRepo := repo.NewBlockchainStateRepo(cfg, logger, dbClient)
	tokRepo := repo.NewTokenRepo(cfg, logger, dbClient)
	gbdRepo := repo.NewGenesisBlockDataRepo(cfg, logger, dbClient)
	bdRepo := repo.NewBlockDataRepo(cfg, logger, dbClient)

	// Use-cases
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
	getAccountsHashStateUseCase := uc_account.NewGetAccountsHashStateUseCase(
		cfg,
		logger,
		accountRepo,
	)
	upsertAccountUseCase := uc_account.NewUpsertAccountUseCase(
		cfg,
		logger,
		accountRepo,
	)
	mempoolTransactionCreateUseCase := uc_mempooltx.NewMempoolTransactionCreateUseCase(
		cfg,
		logger,
		mempoolTxRepo,
	)
	mempoolTransactionDeleteByIDUseCase := uc_mempooltx.NewMempoolTransactionDeleteByIDUseCase(
		cfg,
		logger,
		mempoolTxRepo,
	)
	getBlockchainStateUseCase := uc_blockchainstate.NewGetBlockchainStateUseCase(
		cfg,
		logger,
		blockchainStateRepo,
	)
	upsertBlockchainStateUseCase := uc_blockchainstate.NewUpsertBlockchainStateUseCase(
		cfg,
		logger,
		blockchainStateRepo,
	)
	blockchainStatePublishUseCase := uc_blockchainstate.NewBlockchainStatePublishUseCase(
		logger,
		redisCacheProvider,
	)
	getGenesisBlockDataUseCase := uc_genesisblockdata.NewGetGenesisBlockDataUseCase(
		cfg,
		logger,
		gbdRepo,
	)
	getBlockDataUseCase := uc_blockdata.NewGetBlockDataUseCase(
		cfg,
		logger,
		bdRepo,
	)
	getTokenUseCase := uc_token.NewGetTokenUseCase(
		cfg,
		logger,
		tokRepo,
	)
	getTokensHashStateUseCase := uc_token.NewGetTokensHashStateUseCase(
		cfg,
		logger,
		tokRepo,
	)
	upsertTokenIfPreviousTokenNonceGTEUseCase := uc_token.NewUpsertTokenIfPreviousTokenNonceGTEUseCase(
		cfg,
		logger,
		tokRepo,
	)
	proofOfWorkUseCase := uc_pow.NewProofOfWorkUseCase(
		cfg,
		logger,
	)
	upsertBlockDataUseCase := uc_blockdata.NewUpsertBlockDataUseCase(
		cfg,
		logger,
		bdRepo,
	)

	// Services
	getProofOfAuthorityPrivateKeyService := sv_poa.NewGetProofOfAuthorityPrivateKeyService(
		cfg,
		logger,
		privateKeyFromHDWalletUseCase,
	)

	// Create PoA consensus mechanism service
	proofOfAuthorityConsensusMechanismService := sv_poa.NewProofOfAuthorityConsensusMechanismService(
		cfg,
		logger,
		dmutex,
		dbClient,
		getProofOfAuthorityPrivateKeyService,
		mempoolTransactionDeleteByIDUseCase,
		getBlockchainStateUseCase,
		upsertBlockchainStateUseCase,
		getGenesisBlockDataUseCase,
		getBlockDataUseCase,
		getAccountUseCase,
		getAccountsHashStateUseCase,
		upsertAccountUseCase,
		getTokenUseCase,
		getTokensHashStateUseCase,
		upsertTokenIfPreviousTokenNonceGTEUseCase,
		proofOfWorkUseCase,
		upsertBlockDataUseCase,
		blockchainStatePublishUseCase,
	)

	createAccountService := s_account.NewCreateAccountService(
		cfg,
		logger,
		openHDWalletFromMnemonicUseCase,
		privateKeyFromHDWalletUseCase,
		createWalletUseCase,
		createAccountUseCase,
		getAccountUseCase,
	)

	coinTransferService := sv_coin.NewCoinTransferService(
		cfg,
		logger,
		getAccountUseCase,
		privateKeyFromHDWalletUseCase,
		mempoolTransactionCreateUseCase,
		proofOfAuthorityConsensusMechanismService, // Now using the PoA service
	)

	// Create a CSV file to store wallet information
	csvFile, err := os.Create(flagOutputFile)
	if err != nil {
		logger.Error("Failed to create CSV file", slog.Any("error", err))
		log.Fatalf("Failed to create CSV file: %v\n", err)
	}
	defer csvFile.Close()

	// Create a CSV writer
	csvWriter := csv.NewWriter(csvFile)
	defer csvWriter.Flush()

	// Write CSV header
	if err := csvWriter.Write([]string{"Address", "Mnemonic", "Path", "Balance"}); err != nil {
		logger.Error("Failed to write CSV header", slog.Any("error", err))
		log.Fatalf("Failed to write CSV header: %v\n", err)
	}

	// Generate wallets
	wallets := make([]WalletDetails, 0, flagNumWallets)

	logger.Info("Starting wallet generation",
		slog.Int("num_wallets", flagNumWallets),
		slog.Uint64("coins_per_wallet", flagCoinsPerWallet))

	for i := 0; i < flagNumWallets; i++ {
		// Generate a new mnemonic for each wallet
		mnemonic, err := keystore.GenerateMnemonic()
		if err != nil {
			logger.Error("Failed to generate mnemonic", slog.Any("error", err))
			log.Fatalf("Failed to generate mnemonic: %v\n", err)
		}

		secureString, err := sstring.NewSecureString(mnemonic)
		if err != nil {
			logger.Error("Failed to secure mnemonic string", slog.Any("error", err))
			log.Fatalf("Failed to secure mnemonic string: %v\n", err)
		}
		defer secureString.Wipe()

		// Create a new wallet and account using the mnemonic
		ctx := context.Background()

		account, err := createAccountFromMnemonic(ctx, logger, createAccountService, secureString, flagPath, fmt.Sprintf("Generated Wallet %d", i+1))
		if err != nil {
			logger.Error("Failed to create account", slog.Any("error", err))
			log.Fatalf("Failed to create account: %v\n", err)
		}

		// Fund the wallet from the authority account
		err = fundAccount(ctx, logger, coinTransferService, dbClient, cfg, account.Address, flagCoinsPerWallet)
		if err != nil {
			logger.Error("Failed to fund account",
				slog.Any("address", account.Address),
				slog.Any("error", err))
			log.Fatalf("Failed to fund account: %v\n", err)
		}

		// Add wallet to the list
		walletDetails := WalletDetails{
			Address:  account.Address.Hex(),
			Mnemonic: mnemonic,
			Path:     flagPath,
			Balance:  flagCoinsPerWallet,
		}
		wallets = append(wallets, walletDetails)

		// Write wallet details to CSV
		if err := csvWriter.Write([]string{
			walletDetails.Address,
			walletDetails.Mnemonic,
			walletDetails.Path,
			fmt.Sprintf("%d", walletDetails.Balance),
		}); err != nil {
			logger.Error("Failed to write wallet to CSV", slog.Any("error", err))
			log.Fatalf("Failed to write wallet to CSV: %v\n", err)
		}
		csvWriter.Flush()

		logger.Info("Generated and funded wallet",
			slog.Int("number", i+1),
			slog.String("address", account.Address.Hex()))

		// Add a small delay between wallet creations to avoid overwhelming the system
		time.Sleep(500 * time.Millisecond)
	}

	logger.Info("Successfully generated and funded wallets",
		slog.Int("total_wallets", len(wallets)),
		slog.String("csv_file", flagOutputFile))

	fmt.Printf("Successfully generated %d wallets and funded each with %d ComicCoins.\n", flagNumWallets, flagCoinsPerWallet)
	fmt.Printf("Wallet details saved to: %s\n", flagOutputFile)
}

func createAccountFromMnemonic(ctx context.Context, logger *slog.Logger, service s_account.CreateAccountService, mnemonic *sstring.SecureString, path string, label string) (*domain.Account, error) {
	account, err := service.Execute(ctx, mnemonic, path, label)
	if err != nil {
		return nil, err
	}
	return account, nil
}

func fundAccount(ctx context.Context, logger *slog.Logger, service sv_coin.CoinTransferService, dbClient *mongo.Client, cfg *config.Configuration, recipientAddress *common.Address, amount uint64) error {
	// Start a MongoDB session for the transaction
	session, err := dbClient.StartSession()
	if err != nil {
		logger.Error("Failed to start MongoDB session", slog.Any("error", err))
		return err
	}
	defer session.EndSession(ctx)

	// Define the transaction function
	transactionFunc := func(sessCtx mongo.SessionContext) (interface{}, error) {
		// Transfer coins from authority account to the new wallet
		err = service.Execute(
			sessCtx,
			cfg.Blockchain.ProofOfAuthorityAccountAddress,
			cfg.Blockchain.ProofOfAuthorityWalletMnemonic,
			cfg.Blockchain.ProofOfAuthorityWalletPath,
			recipientAddress,
			amount,
			nil, // No additional data
		)
		if err != nil {
			logger.Error("Failed to transfer coins",
				slog.Any("recipient", recipientAddress),
				slog.Any("amount", amount),
				slog.Any("error", err))
			return nil, err
		}
		return nil, nil
	}

	// Execute the transaction
	_, err = session.WithTransaction(ctx, transactionFunc)
	if err != nil {
		logger.Error("Transaction failed", slog.Any("error", err))
		return err
	}

	return nil
}
