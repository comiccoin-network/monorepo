package daemon

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/spf13/cobra"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/blockchain/keystore"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/distributedmutex"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/logger"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/security/blacklist"
	ipcb "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/security/ipcountryblocker"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/security/jwt"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/security/password"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/storage/database/mongodb"
	cache "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/storage/memory/redis"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/interface/http"
	httphandler "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/interface/http/handler"
	httpmiddle "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/interface/http/middleware"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/interface/task"
	taskhandler "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/interface/task/handler"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/repo"
	s_blockchainstate "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/service/blockchainstate"
	s_blockdata "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/service/blockdata"
	s_blocktx "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/service/blocktx"
	s_genesis "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/service/genesis"
	s_mempooltx "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/service/mempooltx"
	s_poa "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/service/poa"
	s_signedtx "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/service/signedtx"
	s_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/service/token"
	uc_account "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/account"
	uc_blockchainstate "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/blockchainstate"
	uc_blockdata "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/blockdata"
	uc_blocktx "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/blocktx"
	uc_genesisblockdata "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/genesisblockdata"
	uc_mempooltx "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/mempooltx"
	uc_pow "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/pow"
	uc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/token"
	uc_wallet "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/wallet"
)

func DaemonCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "daemon",
		Short: "Run the ComicCoin Authority fullnode",
		Run: func(cmd *cobra.Command, args []string) {
			log.Println("Running daemon......")
			doRunDaemon()
		},
	}
	return cmd
}

func doRunDaemon() {
	//
	// STEP 1
	// Load up our dependencies and configuration
	//

	// Common
	logger := logger.NewProvider()
	cfg := config.NewProvider()
	dbClient := mongodb.NewProvider(cfg, logger)
	keystore := keystore.NewAdapter()
	passp := password.NewProvider()
	jwtp := jwt.NewProvider(cfg)
	blackp := blacklist.NewProvider()
	cachep := cache.NewCache(cfg, logger)
	dmutex := distributedmutex.NewAdapter(logger, cachep.GetRedisClient())
	ipcbp := ipcb.NewProvider(cfg, logger)

	// Repository
	walletRepo := repo.NewWalletRepo(cfg, logger, dbClient)
	accountRepo := repo.NewAccountRepo(cfg, logger, dbClient)
	bdRepo := repo.NewBlockDataRepo(cfg, logger, dbClient)
	gbdRepo := repo.NewGenesisBlockDataRepo(cfg, logger, dbClient)
	bcStateRepo := repo.NewBlockchainStateRepo(cfg, logger, dbClient)
	mempoolTxRepo := repo.NewMempoolTransactionRepo(cfg, logger, dbClient)
	tokenRepo := repo.NewTokenRepo(cfg, logger, dbClient)

	// Genesis Block Data
	getGenesisBlockDataUseCase := uc_genesisblockdata.NewGetGenesisBlockDataUseCase(
		cfg,
		logger,
		gbdRepo,
	)

	// Blockchain State
	getBlockchainStateUseCase := uc_blockchainstate.NewGetBlockchainStateUseCase(
		cfg,
		logger,
		bcStateRepo,
	)
	upsertBlockchainStateUseCase := uc_blockchainstate.NewUpsertBlockchainStateUseCase(
		cfg,
		logger,
		bcStateRepo,
	)
	blockchainStateUpdateDetectorUseCase := uc_blockchainstate.NewBlockchainStateUpdateDetectorUseCase(
		cfg,
		logger,
		bcStateRepo,
	)
	defer func() {
		// When we are done, we will need to terminate our access to this resource.
		blockchainStateUpdateDetectorUseCase.Terminate()
	}()
	blockchainStatePublishUseCase := uc_blockchainstate.NewBlockchainStatePublishUseCase(
		logger,
		cachep,
	)
	blockchainStateSubscribeUseCase := uc_blockchainstate.NewBlockchainStateSubscribeUseCase(
		logger,
		cachep,
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
	listBlockTransactionsByAddressUseCase := uc_blocktx.NewListBlockTransactionsByAddressUseCase(
		cfg,
		logger,
		bdRepo,
	)

	// Wallet
	walletDecryptKeyUseCase := uc_wallet.NewWalletDecryptKeyUseCase(
		cfg,
		logger,
		keystore,
		walletRepo,
	)
	getWalletUseCase := uc_wallet.NewGetWalletUseCase(
		cfg,
		logger,
		walletRepo,
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

	// Token
	getTokenUseCase := uc_token.NewGetTokenUseCase(
		cfg,
		logger,
		tokenRepo,
	)
	getTokensHashStateUseCase := uc_token.NewGetTokensHashStateUseCase(
		cfg,
		logger,
		tokenRepo,
	)
	upsertTokenIfPreviousTokenNonceGTEUseCase := uc_token.NewUpsertTokenIfPreviousTokenNonceGTEUseCase(
		cfg,
		logger,
		tokenRepo,
	)
	listTokensByOwnerUseCase := uc_token.NewListTokensByOwnerUseCase(
		cfg,
		logger,
		tokenRepo,
	)

	// Mempool Transaction
	mempoolTransactionCreateUseCase := uc_mempooltx.NewMempoolTransactionCreateUseCase(
		cfg,
		logger,
		mempoolTxRepo,
	)
	mempoolTransactionListByChainIDUseCase := uc_mempooltx.NewMempoolTransactionListByChainIDUseCase(
		cfg,
		logger,
		mempoolTxRepo,
	)
	_ = mempoolTransactionListByChainIDUseCase
	mempoolTransactionDeleteByIDUseCase := uc_mempooltx.NewMempoolTransactionDeleteByIDUseCase(
		cfg,
		logger,
		mempoolTxRepo,
	)
	mempoolTransactionInsertionDetectorUseCase := uc_mempooltx.NewMempoolTransactionInsertionDetectorUseCase(
		cfg,
		logger,
		mempoolTxRepo,
	)
	defer func() {
		// When we are done, we will need to terminate our access to this resource.
		mempoolTransactionInsertionDetectorUseCase.Terminate()
	}()

	// Proof of Work
	proofOfWorkUseCase := uc_pow.NewProofOfWorkUseCase(
		cfg,
		logger,
	)

	// --- Service

	// Genesis
	getGenesisBlockDataService := s_genesis.NewGetGenesisBlockDataService(
		cfg,
		logger,
		getGenesisBlockDataUseCase,
	)

	// Blockchain State
	getBlockchainStateService := s_blockchainstate.NewGetBlockchainStateService(
		cfg,
		logger,
		getBlockchainStateUseCase,
	)

	// Block Data
	getBlockDataService := s_blockdata.NewGetBlockDataService(
		cfg,
		logger,
		getBlockDataUseCase,
	)

	// Block Transaction
	listBlockTransactionsByAddressService := s_blocktx.NewListBlockTransactionsByAddressService(
		cfg,
		logger,
		listBlockTransactionsByAddressUseCase,
	)

	// Coins
	signedTransactionSubmissionService := s_signedtx.NewSignedTransactionSubmissionService(
		cfg,
		logger,
	)

	// MempoolTransaction
	mempoolTransactionReceiveDTOFromNetworkService := s_mempooltx.NewMempoolTransactionReceiveDTOFromNetworkService(
		cfg,
		logger,
		mempoolTransactionCreateUseCase,
	)

	// Proof of Authority Consensus Mechanism
	getProofOfAuthorityPrivateKeyService := s_poa.NewGetProofOfAuthorityPrivateKeyService(
		cfg,
		logger,
		getWalletUseCase,
		walletDecryptKeyUseCase,
	)
	proofOfAuthorityConsensusMechanismService := s_poa.NewProofOfAuthorityConsensusMechanismService(
		cfg,
		logger,
		dmutex,
		dbClient, // We do this so we can use MongoDB's "transactions"
		getProofOfAuthorityPrivateKeyService,
		mempoolTransactionInsertionDetectorUseCase,
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

	// Tokens
	tokenListByOwnerService := s_token.NewTokenListByOwnerService(
		logger,
		listTokensByOwnerUseCase,
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

	// Stream Latest Blockchain State Change

	blockchainStateChangeSubscriptionService := s_blockchainstate.NewBlockchainStateChangeSubscriptionService(
		logger,
		blockchainStateSubscribeUseCase,
	)
	defer func() {
		// When we are done, we will need to terminate our access to this resource.
		blockchainStateChangeSubscriptionService.Terminate(context.Background())
	}()

	//
	// Interface.
	//

	// --- Task Manager --- //
	poaConsensusMechanismTask := taskhandler.NewProofOfAuthorityConsensusMechanismTaskHandler(
		cfg,
		logger,
		proofOfAuthorityConsensusMechanismService,
	)
	taskManager := task.NewTaskManager(
		cfg,
		logger,
		poaConsensusMechanismTask,
	)

	// --- HTTP --- //
	getVersionHTTPHandler := httphandler.NewGetVersionHTTPHandler(
		logger)
	getHealthCheckHTTPHandler := httphandler.NewGetHealthCheckHTTPHandler(
		logger)
	getGenesisBlockDataHTTPHandler := httphandler.NewGetGenesisBlockDataHTTPHandler(
		logger,
		getGenesisBlockDataService)
	getBlockDataHTTPHandler := httphandler.NewGetBlockDataHTTPHandler(
		logger,
		getBlockDataService)
	getBlockchainStateHTTPHandler := httphandler.NewGetBlockchainStateHTTPHandler(
		logger,
		getBlockchainStateService)
	listBlockTransactionsByAddressHTTPHandler := httphandler.NewListBlockTransactionsByAddressHTTPHandler(
		logger,
		listBlockTransactionsByAddressService,
	)
	blockchainStateChangeEventsHTTPHandler := httphandler.NewBlockchainStateChangeEventDTOHTTPHandler(
		logger,
		blockchainStateChangeSubscriptionService)
	blockchainStateServerSentEventsHTTPHandler := httphandler.NewBlockchainStateServerSentEventsHTTPHandler(
		logger,
		getBlockchainStateService)
	signedTransactionSubmissionHTTPHandler := httphandler.NewSignedTransactionSubmissionHTTPHandler(
		logger,
		signedTransactionSubmissionService)
	mempoolTransactionReceiveDTOFromNetworkServiceHTTPHandler := httphandler.NewMempoolTransactionReceiveDTOFromNetworkServiceHTTPHandler(
		logger,
		mempoolTransactionReceiveDTOFromNetworkService)
	tokenListByOwnerHTTPHandler := httphandler.NewTokenListByOwnerHTTPHandler(
		logger,
		tokenListByOwnerService,
	)
	tokenMintServiceHTTPHandler := httphandler.NewTokenMintServiceHTTPHandler(
		cfg,
		logger,
		jwtp,
		passp,
		tokenMintService,
	)
	httpMiddleware := httpmiddle.NewMiddleware(
		logger,
		blackp,
		ipcbp,
	)
	httpServ := http.NewHTTPServer(
		cfg,
		logger,
		httpMiddleware,
		getVersionHTTPHandler,
		getHealthCheckHTTPHandler,
		getGenesisBlockDataHTTPHandler,
		getBlockchainStateHTTPHandler,
		listBlockTransactionsByAddressHTTPHandler,
		blockchainStateChangeEventsHTTPHandler,
		blockchainStateServerSentEventsHTTPHandler,
		getBlockDataHTTPHandler,
		signedTransactionSubmissionHTTPHandler,
		mempoolTransactionReceiveDTOFromNetworkServiceHTTPHandler,
		tokenListByOwnerHTTPHandler,
		tokenMintServiceHTTPHandler,
	)

	//
	// STEP X
	// Execute.
	//

	// Load up our operating system interaction handlers, more specifically
	// signals. The OS sends our application various signals based on the
	// OS's state, we want to listen into the termination signals.
	done := make(chan os.Signal, 1)
	signal.Notify(done, os.Interrupt, syscall.SIGINT, syscall.SIGTERM, syscall.SIGKILL, syscall.SIGUSR1)

	// Run in background
	go httpServ.Run()
	defer httpServ.Shutdown()
	go taskManager.Run()
	defer taskManager.Shutdown()

	logger.Info("ComicCoin Authority is running.")

	<-done
}
