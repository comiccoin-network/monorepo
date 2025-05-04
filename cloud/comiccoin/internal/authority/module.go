package authority

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	httpserver "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/interface/http"
	httphandler "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/interface/http/handler"
	httpmiddle "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/interface/http/middleware"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/interface/task"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/repo"
	sv_account "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/service/account"
	sv_blockchainstate "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/service/blockchainstate"
	sv_blockdata "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/service/blockdata"
	sv_blocktx "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/service/blocktx"
	sv_genesis "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/service/genesis"
	sv_mempooltx "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/service/mempooltx"
	sv_poa "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/service/poa"
	sv_signedtx "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/service/signedtx"
	sv_token "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/service/token"
	sv_tx "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/service/tx"
	uc_account "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/account"
	uc_blockchainstate "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/blockchainstate"
	uc_blockdata "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/blockdata"
	uc_blocktx "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/blocktx"
	uc_genesisblockdata "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/genesisblockdata"
	uc_mempooltx "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/mempooltx"
	uc_nftok "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/nftok"
	uc_pow "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/pow"
	uc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/token"
	uc_walletutil "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/walletutil"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/blockchain/hdkeystore"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/distributedmutex"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/blacklist"
	ipcb "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/ipcountryblocker"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/jwt"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/password"
	cache "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/storage/memory/redis"
)

type AuthorityModule struct {
	config      *config.Configuration
	logger      *slog.Logger
	dbClient    *mongo.Client
	keystore    hdkeystore.KeystoreAdapter
	passp       password.Provider
	jwtp        jwt.Provider
	blackp      blacklist.Provider
	cachep      cache.Cacher
	dmutex      distributedmutex.Adapter
	ipcbp       ipcb.Provider
	httpServer  httpserver.HTTPServer
	taskManager task.TaskManager
}

func NewModule(
	cfg *config.Configuration,
	logger *slog.Logger,
	dbClient *mongo.Client,
	keystore hdkeystore.KeystoreAdapter,
	passp password.Provider,
	jwtp jwt.Provider,
	blackp blacklist.Provider,
	cachep cache.Cacher,
	dmutex distributedmutex.Adapter,
	ipcbp ipcb.Provider,
) *AuthorityModule {

	// Repository
	// walletRepo := repo.NewWalletRepo(cfg, logger, dbClient)
	accountRepo := repo.NewAccountRepo(cfg, logger, dbClient)
	bdRepo := repo.NewBlockDataRepo(cfg, logger, dbClient)
	gbdRepo := repo.NewGenesisBlockDataRepo(cfg, logger, dbClient)
	bcStateRepo := repo.NewBlockchainStateRepo(cfg, logger, dbClient)
	mempoolTxRepo := repo.NewMempoolTransactionRepo(cfg, logger, dbClient)
	tokenRepo := repo.NewTokenRepo(cfg, logger, dbClient)
	nftAssetRepoConfig := repo.NewNFTAssetRepoConfigurationProvider(cfg.NFTStore.URI, "")
	nftAssetRepo := repo.NewNFTAssetRepo(nftAssetRepoConfig, logger)

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
	listBlockTransactionsByAddressUseCase := uc_blocktx.NewListBlockTransactionsByAddressUseCase(
		cfg,
		logger,
		bdRepo,
	)
	getBlockTransactionUseCase := uc_blocktx.NewGetBlockTransactionUseCase(
		cfg,
		logger,
		bdRepo,
	)
	listOwnedTokenBlockTransactionsByAddressUseCase := uc_blocktx.NewListOwnedTokenBlockTransactionsByAddressUseCase(
		cfg,
		logger,
		bdRepo,
	)
	getLatestBlockTransactionsByAddressUseCase := uc_blocktx.NewGetLatestBlockTransactionsByAddressUseCase(
		cfg,
		logger,
		bdRepo,
	)
	listLatestBlockTransactionsUseCase := uc_blocktx.NewListLatestBlockTransactionsUseCase(
		cfg,
		logger,
		bdRepo,
	)

	// Wallet Utils
	privateKeyFromHDWalletUseCase := uc_walletutil.NewPrivateKeyFromHDWalletUseCase(
		cfg,
		logger,
		keystore,
	)

	// Wallet
	// walletDecryptKeyUseCase := uc_wallet.NewWalletDecryptKeyUseCase(
	// 	cfg,
	// 	logger,
	// 	keystore,
	// 	walletRepo,
	// )
	// getWalletUseCase := uc_wallet.NewGetWalletUseCase(
	// 	cfg,
	// 	logger,
	// 	walletRepo,
	// )

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

	// Token Assets
	downloadNFTokMetadataUsecase := uc_nftok.NewDownloadMetadataNonFungibleTokenUseCase(
		logger,
		nftAssetRepo)

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
	_ = mempoolTransactionInsertionDetectorUseCase

	// Proof of Work
	proofOfWorkUseCase := uc_pow.NewProofOfWorkUseCase(
		cfg,
		logger,
	)

	// --- Service

	// Genesis
	getGenesisBlockDataService := sv_genesis.NewGetGenesisBlockDataService(
		cfg,
		logger,
		getGenesisBlockDataUseCase,
	)

	// Account
	getAccountUseService := sv_account.NewGetAccountService(logger, getAccountUseCase)

	// Blockchain State
	getBlockchainStateService := sv_blockchainstate.NewGetBlockchainStateService(
		cfg,
		logger,
		getBlockchainStateUseCase,
	)

	// Block Data
	getBlockDataService := sv_blockdata.NewGetBlockDataService(
		cfg,
		logger,
		getBlockDataUseCase,
	)

	// Block Transaction
	listBlockTransactionsByAddressService := sv_blocktx.NewListBlockTransactionsByAddressService(
		cfg,
		logger,
		listBlockTransactionsByAddressUseCase,
	)
	getBlockTransactionService := sv_blocktx.NewGetBlockTransactionService(
		cfg,
		logger,
		getBlockTransactionUseCase,
	)
	listOwnedTokenBlockTransactionsByAddressService := sv_blocktx.NewListOwnedTokenBlockTransactionsByAddressService(
		cfg,
		logger,
		listOwnedTokenBlockTransactionsByAddressUseCase,
		downloadNFTokMetadataUsecase,
	)
	getLatestBlockTransactionByAddressService := sv_blocktx.NewGetLatestBlockTransactionByAddressService(
		cfg,
		logger,
		getLatestBlockTransactionsByAddressUseCase,
	)
	listLatestBlockTransactionsService := sv_blocktx.NewListLatestBlockTransactionsService(
		cfg,
		logger,
		listLatestBlockTransactionsUseCase,
	)

	// Coins
	signedTransactionSubmissionService := sv_signedtx.NewSignedTransactionSubmissionService(
		cfg,
		logger,
	)
	prepareTransactionService := sv_tx.NewPrepareTransactionService(
		cfg,
		logger,
		getBlockchainStateUseCase,
		getTokenUseCase,
	)

	// Proof of Authority Consensus Mechanism
	getProofOfAuthorityPrivateKeyService := sv_poa.NewGetProofOfAuthorityPrivateKeyService(
		cfg,
		logger,
		privateKeyFromHDWalletUseCase,
	)
	proofOfAuthorityConsensusMechanismService := sv_poa.NewProofOfAuthorityConsensusMechanismService(
		cfg,
		logger,
		dmutex,
		dbClient, // We do this so we can use MongoDB's "transactions"
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

	// MempoolTransaction
	mempoolTransactionReceiveDTOFromNetworkService := sv_mempooltx.NewMempoolTransactionReceiveDTOFromNetworkService(
		cfg,
		logger,
		proofOfAuthorityConsensusMechanismService,
	)

	// Tokens
	tokenListByOwnerService := sv_token.NewTokenListByOwnerService(
		logger,
		listTokensByOwnerUseCase,
	)
	tokenMintService := sv_token.NewTokenMintService(
		cfg,
		logger,
		dmutex,
		dbClient, // Note: Used for mongoDB transaction handling.
		getProofOfAuthorityPrivateKeyService,
		getBlockchainStateUseCase,
		upsertBlockchainStateUseCase,
		getLatestTokenIDUseCase,
		getBlockDataUseCase,
		mempoolTransactionCreateUseCase,
		proofOfAuthorityConsensusMechanismService,
	)

	// Stream Latest Blockchain State Change

	blockchainStateChangeSubscriptionService := sv_blockchainstate.NewBlockchainStateChangeSubscriptionService(
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
	// poaConsensusMechanismTask := taskhandler.NewProofOfAuthorityConsensusMechanismTaskHandler(
	// 	cfg,
	// 	logger,
	// 	proofOfAuthorityConsensusMechanismService,
	// )
	taskManager := task.NewTaskManager(
		cfg,
		logger,
		// poaConsensusMechanismTask,
	)

	// --- HTTP --- //
	indexHTTPHandler := httphandler.NewIndexHTTPHandler(
		cfg,
		logger,
		listLatestBlockTransactionsService,
	)
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
	getBlockTransactionByNonceHTTPHandler := httphandler.NewGetBlockTransactionByNonceHTTPHandler(
		logger,
		getBlockTransactionService,
	)
	listOwnedTokenBlockTransactionsByAddressHTTPHandler := httphandler.NewListOwnedTokenBlockTransactionsByAddressHTTPHandler(
		logger,
		listOwnedTokenBlockTransactionsByAddressService,
	)
	blockchainStateChangeEventsHTTPHandler := httphandler.NewBlockchainStateChangeEventDTOHTTPHandler(
		logger,
		blockchainStateChangeSubscriptionService)
	blockchainStateServerSentEventsHTTPHandler := httphandler.NewBlockchainStateServerSentEventsHTTPHandler(
		logger,
		getBlockchainStateService)
	getLatestBlockTransactionByAddressServerSentEventsHTTPHandler := httphandler.NewGetLatestBlockTransactionByAddressServerSentEventsHTTPHandler(
		logger,
		getLatestBlockTransactionByAddressService)
	prepareTransactionHTTPHandler := httphandler.NewPrepareTransactionHTTPHandler(
		logger,
		prepareTransactionService)
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
	getAccountBalance := httphandler.NewGetAccountBalanceHTTPHandler(
		logger,
		getAccountUseService,
	)
	httpMiddleware := httpmiddle.NewMiddleware(
		logger,
		blackp,
		ipcbp,
	)
	httpServ := httpserver.NewHTTPServer(
		cfg,
		logger,
		httpMiddleware,
		getVersionHTTPHandler,
		getHealthCheckHTTPHandler,
		getGenesisBlockDataHTTPHandler,
		getBlockchainStateHTTPHandler,
		listBlockTransactionsByAddressHTTPHandler,
		getBlockTransactionByNonceHTTPHandler,
		listOwnedTokenBlockTransactionsByAddressHTTPHandler,
		blockchainStateChangeEventsHTTPHandler,
		blockchainStateServerSentEventsHTTPHandler,
		getLatestBlockTransactionByAddressServerSentEventsHTTPHandler,
		getBlockDataHTTPHandler,
		prepareTransactionHTTPHandler,
		signedTransactionSubmissionHTTPHandler,
		mempoolTransactionReceiveDTOFromNetworkServiceHTTPHandler,
		tokenListByOwnerHTTPHandler,
		tokenMintServiceHTTPHandler,
		getAccountBalance,
		indexHTTPHandler,
	)

	return &AuthorityModule{
		config:      cfg,
		logger:      logger,
		dbClient:    dbClient,
		keystore:    keystore,
		passp:       passp,
		jwtp:        jwtp,
		blackp:      blackp,
		cachep:      cachep,
		dmutex:      dmutex,
		ipcbp:       ipcbp,
		httpServer:  httpServ,
		taskManager: taskManager,
	}

}

func (s *AuthorityModule) GetHTTPServerInstance() httpserver.HTTPServer {
	return s.httpServer
}

func (s *AuthorityModule) GetTaskManagerInstance() task.TaskManager {
	return s.taskManager
}
