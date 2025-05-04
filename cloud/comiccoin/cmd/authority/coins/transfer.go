package coins

import (
	"context"
	"log"
	"log/slog"
	"strings"

	"github.com/ethereum/go-ethereum/common"
	"github.com/spf13/cobra"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/repo"
	sv_coin "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/service/coin"
	sv_poa "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/service/poa"
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
	redis_cache "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/storage/memory/redis"
)

// Command line argument flags
var (
	flagKeystoreFile         string // Location of the wallet keystore
	flagDataDir              string // Location of the database directory
	flagLabel                string
	flagCoinbaseAddress      string
	flagRecipientAddress     string
	flagQuantity             uint64
	flagKeypairName          string
	flagSenderAccountAddress string
	flagData                 string

	flagRendezvousString string
	flagBootstrapPeers   string
	flagListenAddresses  string

	flagListenHTTPPort       int
	flagListenHTTPIP         string
	flagListenPeerToPeerPort int

	flagListenHTTPAddress string

	flagIdentityKeyID string
)

func TransferCoinsCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "transfer",
		Short: "Submit a transaction to the ComicCoin blockchain network to transfer coins from coinbase account to another account",
		Run: func(cmd *cobra.Command, args []string) {
			doRunTransferCoinsCommand()
		},
	}

	cmd.Flags().Uint64Var(&flagQuantity, "value", 0, "The amount of coins to send")
	cmd.MarkFlagRequired("value")

	cmd.Flags().StringVar(&flagData, "data", "", "Optional data to include with this transaction")

	cmd.Flags().StringVar(&flagRecipientAddress, "recipient-address", "", "The address of the account whom will receive this coin")
	cmd.MarkFlagRequired("recipient-address")

	cmd.Flags().IntVar(&flagListenHTTPPort, "listen-http-port", 8000, "The HTTP JSON API server's port")
	cmd.Flags().StringVar(&flagListenHTTPIP, "listen-http-ip", "127.0.0.1", "The HTTP JSON API server's ip-address")

	return cmd
}

func doRunTransferCoinsCommand() {
	//
	// Load up dependencies.
	//

	// ------ Common ------
	logger := logger.NewProvider()
	cfg := config.NewProvider()
	dbClient := mongodb.NewProvider(cfg, logger)
	keystore := hdkeystore.NewAdapter()
	redisCacheProvider := redis_cache.NewCache(cfg, logger)
	dmutex := distributedmutex.NewAdapter(logger, redisCacheProvider.GetRedisClient())

	// ------ Repository ------
	accountRepo := repo.NewAccountRepo(cfg, logger, dbClient)
	mempoolTxRepo := repo.NewMempoolTransactionRepo(cfg, logger, dbClient)
	blockchainStateRepo := repo.NewBlockchainStateRepo(cfg, logger, dbClient)
	tokRepo := repo.NewTokenRepo(cfg, logger, dbClient)
	gbdRepo := repo.NewGenesisBlockDataRepo(cfg, logger, dbClient)
	bdRepo := repo.NewBlockDataRepo(cfg, logger, dbClient)

	// ------ Use-case ------
	// Wallet
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

	// Include all other necessary use cases for PoA service
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
	blockchainStatePublishUseCase := uc_blockchainstate.NewBlockchainStatePublishUseCase(
		logger,
		redisCacheProvider,
	)

	// ------ Service ------
	// Create PoA service
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

	// Coin Transfer service now also takes the PoA service
	coinTransferService := sv_coin.NewCoinTransferService(
		cfg,
		logger,
		getAccountUseCase,
		privateKeyFromHDWalletUseCase,
		mempoolTransactionCreateUseCase,
		proofOfAuthorityConsensusMechanismService,
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

		recAddr := common.HexToAddress(strings.ToLower(flagRecipientAddress))

		// Execution - now we directly submit to PoA
		err := coinTransferService.Execute(
			sessCtx,
			cfg.Blockchain.ProofOfAuthorityAccountAddress,
			cfg.Blockchain.ProofOfAuthorityWalletMnemonic,
			cfg.Blockchain.ProofOfAuthorityWalletPath,
			&recAddr,
			flagQuantity,
			[]byte(flagData),
		)
		if err != nil {
			logger.Error("Failed transfering coins",
				slog.Any("error", err))
			return nil, err
		}
		return nil, nil
	}

	// Start a transaction
	if _, err := session.WithTransaction(ctx, transactionFunc); err != nil {
		logger.Error("session failed error",
			slog.Any("error", err))
		log.Fatalf("Failed transfering coins: %v\n", err)
	}

	logger.Debug("Coins transfered",
		slog.Any("from", "coinbase"),
		slog.Any("to", cfg.Blockchain.ProofOfAuthorityAccountAddress),
		slog.Any("quantity", flagQuantity),
	)
}
