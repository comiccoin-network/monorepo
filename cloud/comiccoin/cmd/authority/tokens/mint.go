package tokens

import (
	"context"
	"errors"
	"log"
	"log/slog"

	"github.com/spf13/cobra"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/repo"
	sv_poa "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/service/poa"
	sv_token "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/service/token"
	uc_account "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/account"
	uc_blockchainstate "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/blockchainstate"
	uc_blockdata "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/blockdata"
	uc_genesisblockdata "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/genesisblockdata"
	uc_mempooltx "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/mempooltx"
	uc_pow "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/pow"
	uc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/token"
	uc_walletutil "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/walletutil"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/blockchain/hdkeystore"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/distributedmutex"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/logger"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/storage/database/mongodb"
	cache "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/storage/memory/redis"
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
	keystore := hdkeystore.NewAdapter()
	cachep := cache.NewCache(cfg, logger)
	dmutex := distributedmutex.NewAdapter(logger, cachep.GetRedisClient())

	// ------ Repository ------
	accountRepo := repo.NewAccountRepo(cfg, logger, dbClient)
	blockchainStateRepo := repo.NewBlockchainStateRepo(cfg, logger, dbClient)
	tokRepo := repo.NewTokenRepo(cfg, logger, dbClient)
	gbdRepo := repo.NewGenesisBlockDataRepo(cfg, logger, dbClient)
	bdRepo := repo.NewBlockDataRepo(cfg, logger, dbClient)
	mempoolTxRepo := repo.NewMempoolTransactionRepo(cfg, logger, dbClient)

	// ------ Use-case ------
	// Wallet Utils
	privateKeyFromHDWalletUseCase := uc_walletutil.NewPrivateKeyFromHDWalletUseCase(
		cfg,
		logger,
		keystore,
	)

	// Account
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
	blockchainStatePublishUseCase := uc_blockchainstate.NewBlockchainStatePublishUseCase(
		logger,
		cachep,
	)

	// Block Data
	getBlockDataUseCase := uc_blockdata.NewGetBlockDataUseCase(
		cfg,
		logger,
		bdRepo,
	)
	getLatestTokenIDUseCase := uc_blockdata.NewGetLatestTokenIDUseCase(
		cfg,
		logger,
		bdRepo,
	)
	upsertBlockDataUseCase := uc_blockdata.NewUpsertBlockDataUseCase(
		cfg,
		logger,
		bdRepo,
	)

	// Genesis Block Data
	getGenesisBlockDataUseCase := uc_genesisblockdata.NewGetGenesisBlockDataUseCase(
		cfg,
		logger,
		gbdRepo,
	)

	// Token
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

	// Proof of Work
	proofOfWorkUseCase := uc_pow.NewProofOfWorkUseCase(
		cfg,
		logger,
	)

	// Mempool Transaction
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

	// ------ Service ------
	// Create PoA service for private key access
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

	// Token Mint service with direct PoA submission
	tokenMintService := sv_token.NewTokenMintService(
		cfg,
		logger,
		dmutex,
		dbClient,
		getProofOfAuthorityPrivateKeyService,
		getBlockchainStateUseCase,
		upsertBlockchainStateUseCase,
		getLatestTokenIDUseCase,
		getBlockDataUseCase,
		mempoolTransactionCreateUseCase,
		proofOfAuthorityConsensusMechanismService, // Add the PoA service
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
