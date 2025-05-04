package tokens

import (
	"context"
	"log"
	"log/slog"
	"math/big"
	"strings"

	"github.com/ethereum/go-ethereum/common"
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
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/kmutexutil"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/logger"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/storage/database/mongodb"
	redis_cache "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/storage/memory/redis"
)

func BurnTokenCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "burn",
		Short: "Burns a non-fungible token you own",
		Run: func(cmd *cobra.Command, args []string) {
			doRunBurnToken()
		},
	}

	cmd.Flags().StringVar(&flagBurnTokenID, "token-id", "", "The ID of the token that you own")
	cmd.MarkFlagRequired("token-id")

	return cmd
}

func doRunBurnToken() {
	//
	// Load up dependencies.
	//

	// ------ Common ------
	logger := logger.NewProvider()
	cfg := config.NewProvider()
	dbClient := mongodb.NewProvider(cfg, logger)
	keystore := hdkeystore.NewAdapter()
	kmutex := kmutexutil.NewKMutexProvider()
	redisCacheProvider := redis_cache.NewCache(cfg, logger)
	dmutex := distributedmutex.NewAdapter(logger, redisCacheProvider.GetRedisClient())

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
		redisCacheProvider,
	)

	// Block Data
	getBlockDataUseCase := uc_blockdata.NewGetBlockDataUseCase(
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

	// Token Burn service with direct PoA submission
	tokenBurnService := sv_token.NewTokenBurnService(
		cfg,
		logger,
		kmutex,
		dbClient,
		privateKeyFromHDWalletUseCase,
		getBlockchainStateUseCase,
		upsertBlockchainStateUseCase,
		getBlockDataUseCase,
		getTokenUseCase,
		mempoolTransactionCreateUseCase,
		proofOfAuthorityConsensusMechanismService, // Add the PoA service
	)

	// Execution
	ctx := context.Background()
	burnRecipientAddress := common.HexToAddress(strings.ToLower(flagBurnRecipientAddress))
	tokenID, ok := new(big.Int).SetString(flagBurnTokenID, 10)
	if !ok {
		log.Fatalf("Failed converting to big.Int: %v", flagTokenID)
	}
	logger.Debug("burning token...",
		slog.Any("address", burnRecipientAddress),
		slog.Any("token_id", tokenID.Uint64()))

	err := tokenBurnService.Execute(
		ctx,
		tokenID,
		cfg.Blockchain.ProofOfAuthorityAccountAddress,
		cfg.Blockchain.ProofOfAuthorityWalletMnemonic,
		cfg.Blockchain.ProofOfAuthorityWalletPath,
	)
	if err != nil {
		logger.Error("Failed executing",
			slog.Any("error", err))
		log.Fatalf("Failed executing: %v\n", err)
	}
	logger.Debug("Token burned")
}
