package tokens

import (
	"context"
	"errors"
	"log"
	"log/slog"

	"github.com/spf13/cobra"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/blockchain/keystore"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/distributedmutex"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/logger"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/storage/database/mongodb"
	cache "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/storage/memory/redis"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/repo"
	s_poa "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/service/poa"
	s_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/service/token"
	uc_blockchainstate "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/blockchainstate"
	uc_blockdata "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/blockdata"
	uc_mempooltx "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/mempooltx"
	uc_wallet "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/wallet"
)

func MintTokenCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "mint",
		Short: "Creates a new non-fungible token in our blockchain",
		Run: func(cmd *cobra.Command, args []string) {
			doRunMintToken()
		},
	}

	cmd.Flags().StringVar(&flagTokenMetadataURI, "metadata-uri", "", "The location of this tokens metadata file.")
	cmd.MarkFlagRequired("metadata-uri")

	return cmd
}

func doRunMintToken() {
	//
	// Load up dependencies.
	//

	// ------ Common ------
	logger := logger.NewProvider()
	cfg := config.NewProvider()
	dbClient := mongodb.NewProvider(cfg, logger)
	keystore := keystore.NewAdapter()
	cachep := cache.NewCache(cfg, logger)
	dmutex := distributedmutex.NewAdapter(logger, cachep.GetRedisClient())

	// ------ Repository ------
	walletRepo := repo.NewWalletRepo(cfg, logger, dbClient)
	// accountRepo := repo.NewAccountRepo(cfg, logger, dbClient)
	blockchainStateRepo := repo.NewBlockchainStateRepo(cfg, logger, dbClient)
	// tokRepo := repo.NewTokenRepo(cfg, logger, dbClient)
	// gbdRepo := repo.NewGenesisBlockDataRepo(cfg, logger, dbClient)
	bdRepo := repo.NewBlockDataRepo(cfg, logger, dbClient)
	mempoolTxRepo := repo.NewMempoolTransactionRepo(cfg, logger, dbClient)

	// // ------ Use-case ------
	// // Wallet
	// walletEncryptKeyUseCase := usecase.NewWalletEncryptKeyUseCase(
	// 	cfg,
	// 	logger,
	// 	keystore,
	// 	walletRepo,
	// )
	// _ = walletEncryptKeyUseCase
	walletDecryptKeyUseCase := uc_wallet.NewWalletDecryptKeyUseCase(
		cfg,
		logger,
		keystore,
		walletRepo,
	)
	// createWalletUseCase := usecase.NewCreateWalletUseCase(
	// 	cfg,
	// 	logger,
	// 	walletRepo,
	// )
	// _ = createWalletUseCase
	getWalletUseCase := uc_wallet.NewGetWalletUseCase(
		cfg,
		logger,
		walletRepo,
	)

	// // Account
	// createAccountUseCase := usecase.NewCreateAccountUseCase(
	// 	cfg,
	// 	logger,
	// 	accountRepo,
	// )
	// _ = createAccountUseCase
	// getAccountUseCase := usecase.NewGetAccountUseCase(
	// 	cfg,
	// 	logger,
	// 	accountRepo,
	// )
	// _ = getAccountUseCase
	// upsertAccountUseCase := usecase.NewUpsertAccountUseCase(
	// 	cfg,
	// 	logger,
	// 	accountRepo,
	// )
	// getAccountsHashStateUseCase := usecase.NewGetAccountsHashStateUseCase(
	// 	cfg,
	// 	logger,
	// 	accountRepo,
	// )
	//
	// Blockchain State
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

	// // Token
	// upsertTokenIfPreviousTokenNonceGTEUseCase := usecase.NewUpsertTokenIfPreviousTokenNonceGTEUseCase(
	// 	cfg,
	// 	logger,
	// 	tokRepo,
	// )
	// getTokensHashStateUseCase := usecase.NewGetTokensHashStateUseCase(
	// 	cfg,
	// 	logger,
	// 	tokRepo,
	// )
	//
	// // Genesis BlockData
	// upsertGenesisBlockDataUseCase := usecase.NewUpsertGenesisBlockDataUseCase(
	// 	cfg,
	// 	logger,
	// 	gbdRepo,
	// )
	//
	// BlockData
	getBlockDataUseCase := uc_blockdata.NewGetBlockDataUseCase(
		cfg,
		logger,
		bdRepo,
	)
	// upsertBlockDataUseCase := usecase.NewUpsertBlockDataUseCase(
	// 	cfg,
	// 	logger,
	// 	bdRepo,
	// )
	//
	// // Proof of Work
	// proofOfWorkUseCase := usecase.NewProofOfWorkUseCase(
	// 	cfg,
	// 	logger,
	// )

	// Mempool Transaction
	mempoolTransactionCreateUseCase := uc_mempooltx.NewMempoolTransactionCreateUseCase(
		cfg,
		logger,
		mempoolTxRepo,
	)

	// ------ Service ------
	getProofOfAuthorityPrivateKeyService := s_poa.NewGetProofOfAuthorityPrivateKeyService(
		cfg,
		logger,
		getWalletUseCase,
		walletDecryptKeyUseCase,
	)
	tokenMintService := s_token.NewTokenMintService(
		cfg,
		logger,
		dmutex,
		dbClient, // Note: Used for mongoDB transaction handling.
		getProofOfAuthorityPrivateKeyService,
		getBlockchainStateUseCase,
		upsertBlockchainStateUseCase,
		getBlockDataUseCase,
		mempoolTransactionCreateUseCase,
	)

	// Execution
	ctx := context.Background()
	newTokID, err := tokenMintService.Execute(ctx, cfg.Blockchain.ProofOfAuthorityAccountAddress, flagTokenMetadataURI)
	if err != nil {
		logger.Error("Failed executing",
			slog.Any("error", err))
		log.Fatalf("Failed executing: %v\n", err)
	}
	if newTokID == nil {
		err := errors.New("Token does not exist")
		log.Fatal(err)
	}

	logger.Debug("Token created",
		slog.Any("id", newTokID),
	)
}
