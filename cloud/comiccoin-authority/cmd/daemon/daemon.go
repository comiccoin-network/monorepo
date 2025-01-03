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
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/service"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase"
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
	getGenesisBlockDataUseCase := usecase.NewGetGenesisBlockDataUseCase(
		cfg,
		logger,
		gbdRepo,
	)

	// Blockchain State
	getBlockchainStateUseCase := usecase.NewGetBlockchainStateUseCase(
		cfg,
		logger,
		bcStateRepo,
	)
	upsertBlockchainStateUseCase := usecase.NewUpsertBlockchainStateUseCase(
		cfg,
		logger,
		bcStateRepo,
	)
	blockchainStateUpdateDetectorUseCase := usecase.NewBlockchainStateUpdateDetectorUseCase(
		cfg,
		logger,
		bcStateRepo,
	)
	defer func() {
		// When we are done, we will need to terminate our access to this resource.
		blockchainStateUpdateDetectorUseCase.Terminate()
	}()
	blockchainStatePublishUseCase := usecase.NewBlockchainStatePublishUseCase(
		logger,
		cachep,
	)
	blockchainStateSubscribeUseCase := usecase.NewBlockchainStateSubscribeUseCase(
		logger,
		cachep,
	)

	// Block Data
	getBlockDataUseCase := usecase.NewGetBlockDataUseCase(
		cfg,
		logger,
		bdRepo,
	)
	upsertBlockDataUseCase := usecase.NewUpsertBlockDataUseCase(
		cfg,
		logger,
		bdRepo,
	)
	listBlockTransactionsByAddressUseCase := usecase.NewListBlockTransactionsByAddressUseCase(
		cfg,
		logger,
		bdRepo,
	)

	// Wallet
	walletDecryptKeyUseCase := usecase.NewWalletDecryptKeyUseCase(
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

	// Account
	getAccountUseCase := usecase.NewGetAccountUseCase(
		cfg,
		logger,
		accountRepo,
	)
	getAccountsHashStateUseCase := usecase.NewGetAccountsHashStateUseCase(
		cfg,
		logger,
		accountRepo,
	)
	upsertAccountUseCase := usecase.NewUpsertAccountUseCase(
		cfg,
		logger,
		accountRepo,
	)

	// Token
	getTokenUseCase := usecase.NewGetTokenUseCase(
		cfg,
		logger,
		tokenRepo,
	)
	getTokensHashStateUseCase := usecase.NewGetTokensHashStateUseCase(
		cfg,
		logger,
		tokenRepo,
	)
	upsertTokenIfPreviousTokenNonceGTEUseCase := usecase.NewUpsertTokenIfPreviousTokenNonceGTEUseCase(
		cfg,
		logger,
		tokenRepo,
	)
	listTokensByOwnerUseCase := usecase.NewListTokensByOwnerUseCase(
		cfg,
		logger,
		tokenRepo,
	)

	// Mempool Transaction
	mempoolTransactionCreateUseCase := usecase.NewMempoolTransactionCreateUseCase(
		cfg,
		logger,
		mempoolTxRepo,
	)
	mempoolTransactionListByChainIDUseCase := usecase.NewMempoolTransactionListByChainIDUseCase(
		cfg,
		logger,
		mempoolTxRepo,
	)
	_ = mempoolTransactionListByChainIDUseCase
	mempoolTransactionDeleteByIDUseCase := usecase.NewMempoolTransactionDeleteByIDUseCase(
		cfg,
		logger,
		mempoolTxRepo,
	)
	mempoolTransactionInsertionDetectorUseCase := usecase.NewMempoolTransactionInsertionDetectorUseCase(
		cfg,
		logger,
		mempoolTxRepo,
	)
	defer func() {
		// When we are done, we will need to terminate our access to this resource.
		mempoolTransactionInsertionDetectorUseCase.Terminate()
	}()

	// Proof of Work
	proofOfWorkUseCase := usecase.NewProofOfWorkUseCase(
		cfg,
		logger,
	)

	// --- Service

	// Genesis
	getGenesisBlockDataService := service.NewGetGenesisBlockDataService(
		cfg,
		logger,
		getGenesisBlockDataUseCase,
	)

	// Blockchain State
	getBlockchainStateService := service.NewGetBlockchainStateService(
		cfg,
		logger,
		getBlockchainStateUseCase,
	)

	// Block Data
	getBlockDataService := service.NewGetBlockDataService(
		cfg,
		logger,
		getBlockDataUseCase,
	)

	// Block Transaction
	listBlockTransactionsByAddressService := service.NewListBlockTransactionsByAddressService(
		cfg,
		logger,
		listBlockTransactionsByAddressUseCase,
	)

	// Coins
	signedTransactionSubmissionService := service.NewSignedTransactionSubmissionService(
		cfg,
		logger,
	)

	// MempoolTransaction
	mempoolTransactionReceiveDTOFromNetworkService := service.NewMempoolTransactionReceiveDTOFromNetworkService(
		cfg,
		logger,
		mempoolTransactionCreateUseCase,
	)

	// Proof of Authority Consensus Mechanism
	getProofOfAuthorityPrivateKeyService := service.NewGetProofOfAuthorityPrivateKeyService(
		cfg,
		logger,
		getWalletUseCase,
		walletDecryptKeyUseCase,
	)
	proofOfAuthorityConsensusMechanismService := service.NewProofOfAuthorityConsensusMechanismService(
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
	tokenListByOwnerService := service.NewTokenListByOwnerService(
		logger,
		listTokensByOwnerUseCase,
	)
	tokenMintService := service.NewTokenMintService(
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

	blockchainStateChangeSubscriptionService := service.NewBlockchainStateChangeSubscriptionService(
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
