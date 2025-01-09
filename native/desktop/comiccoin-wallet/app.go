package main

import (
	"context"
	"fmt"
	"log"
	"log/slog"
	"time"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/blockchain/hdkeystore"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/kmutexutil"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/logger"
	disk "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/storage/disk/leveldb"
	inmemory "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/storage/memory/inmemory"
	auth_repo "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/repo"
	uc_blockchainstatedto "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/blockchainstatedto"
	uc_blockdatadto "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/blockdatadto"
	uc_genesisblockdatadto "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/genesisblockdatadto"
	uc_mempooltxdto "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/mempooltxdto"

	"github.com/comiccoin-network/monorepo/native/desktop/comiccoin/repo"
	"github.com/comiccoin-network/monorepo/native/desktop/comiccoin/service"
	service_account "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/service/account"
	service_blockchain "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/service/blockchain"
	service_blockchainsyncstatus "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/service/blockchainsyncstatus"
	service_blockdata "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/service/blockdata"
	service_blocktx "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/service/blocktx"
	service_coin "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/service/coin"
	uc_account "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/usecase/account"
	uc_blockchainstate "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/usecase/blockchainstate"
	uc_blockchainsyncstatus "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/usecase/blockchainsyncstatus"
	uc_blockdata "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/usecase/blockdata"
	uc_blocktx "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/usecase/blocktx"
	uc_genesisblockdata "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/usecase/genesisblockdata"
	uc_nftok "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/usecase/nftok"
	uc_pstx "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/usecase/pstx"
	uc_storagetransaction "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/usecase/storagetransaction"
	uc_tok "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/usecase/tok"
	uc_wallet "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/usecase/wallet"
	uc_walletutil "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/usecase/walletutil"
)

// App struct
type App struct {
	ctx context.Context

	// Logger instance which provides detailed debugging information along
	// with the console log messages.
	logger *slog.Logger

	kmutex kmutexutil.KMutexProvider

	getBlockchainSyncStatusService                                  *service_blockchainsyncstatus.GetBlockchainSyncStatusService
	getAccountService                                               *service_account.GetAccountService
	createAccountService                                            *service_account.CreateAccountService
	accountListingByLocalWalletsService                             *service_account.AccountListingByLocalWalletsService
	coinTransferService                                             *service_coin.CoinTransferService
	tokenGetService                                                 *service.TokenGetService
	tokenTransferService                                            *service.TokenTransferService
	tokenBurnService                                                *service.TokenBurnService
	getOrDownloadNonFungibleTokenService                            *service.GetOrDownloadNonFungibleTokenService
	listBlockTransactionsByAddressService                           *service_blocktx.ListBlockTransactionsByAddressService
	listWithLimitBlockTransactionsByAddressService                  *service_blocktx.ListWithLimitBlockTransactionsByAddressService
	getByBlockTransactionTimestampService                           *service_blockdata.GetByBlockTransactionTimestampService
	blockDataGetByHashService                                       *service_blockdata.BlockDataGetByHashService
	tokenListByOwnerService                                         *service.TokenListByOwnerService
	tokenCountByOwnerService                                        *service.TokenCountByOwnerService
	blockchainSyncService                                           *service_blockchain.BlockchainSyncWithBlockchainAuthorityService
	blockchainSyncWithBlockchainAuthorityViaServerSentEventsService *service_blockchain.BlockchainSyncWithBlockchainAuthorityViaServerSentEventsService
	walletsFilterByLocalService                                     *service.WalletsFilterByLocalService
	listNonFungibleTokensByOwnerService                             *service.ListNonFungibleTokensByOwnerService
	pendingSignedTransactionListService                             *service.PendingSignedTransactionListService
	exportWalletService                                             *service.ExportWalletService
	importWalletService                                             *service.ImportWalletService
	walletRecoveryService                                           *service.WalletRecoveryService
}

// NewApp creates a new App application struct
func NewApp() *App {
	logger := logger.NewProvider()
	kmutex := kmutexutil.NewKMutexProvider()
	return &App{
		logger: logger,
		kmutex: kmutex,
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	// Ensure that this function executes only one time and never concurrently.
	a.kmutex.Acquire("startup")
	defer a.kmutex.Release("startup")

	a.ctx = ctx
	a.logger.Debug("Startup beginning...")

	// DEVELOPERS NOTE:
	// Before we startup our app, we need to make sure the `data directory` is
	// set for this application by the user, else stop the app startup
	// procedure. This is done on purpose because we need the user to specify
	// the location they want to store instead of having one automatically set.
	preferences := PreferencesInstance()
	dataDir := preferences.DataDirectory
	if dataDir == "" {
		return
	}

	// DEVELOPERS NOTE:
	// Defensive code for programmer in case all the required environment
	// variables are not set then abort this program.
	// preferences.RunFatalIfHasAnyMissingFields() // ONLY USE IN CLI, NOT GUI WALLET!

	nftStorageAddress := preferences.NFTStorageAddress
	chainID := preferences.ChainID
	authorityAddress := preferences.AuthorityAddress

	//
	// DEVELOPERS NOTE:
	// Load up our dependencies and configuration
	//

	// ------ Common ------

	logger := logger.NewProvider()
	keystore := hdkeystore.NewAdapter()
	memDB := inmemory.NewInMemoryStorage(logger)
	walletDB := disk.NewDiskStorage(dataDir, "wallet", logger)
	accountDB := disk.NewDiskStorage(dataDir, "account", logger)
	genesisBlockDataDB := disk.NewDiskStorage(dataDir, "genesis_block_data", logger)
	blockchainStateDB := disk.NewDiskStorage(dataDir, "blockchain_state", logger)
	blockDataDB := disk.NewDiskStorage(dataDir, "block_data", logger)
	tokDB := disk.NewDiskStorage(dataDir, "token", logger)
	nftokDB := disk.NewDiskStorage(dataDir, "non_fungible_token", logger)
	pstxDB := disk.NewDiskStorage(dataDir, "pending_signed_transaction", logger)

	// ------------ Repo ------------

	blockchainStateServerSentEventsDTOConfigurationProvider := repo.NewBlockchainStateServerSentEventsDTOConfigurationProvider(preferences.AuthorityAddress)
	blockchainStateServerSentEventsDTORepo := repo.NewBlockchainStateServerSentEventsDTORepository(
		blockchainStateServerSentEventsDTOConfigurationProvider,
		logger)
	accountRepo := repo.NewAccountRepo(
		logger,
		accountDB)
	walletRepo := repo.NewWalletRepo(
		logger,
		walletDB)
	genesisBlockDataRepo := repo.NewGenesisBlockDataRepo(
		logger,
		genesisBlockDataDB)
	blockchainStateRepo := repo.NewBlockchainStateRepo(
		logger,
		blockchainStateDB)
	blockchainStateDTORepoConfig := auth_repo.NewBlockchainStateDTOConfigurationProvider(authorityAddress)
	blockchainStateDTORepo := auth_repo.NewBlockchainStateDTORepo(
		blockchainStateDTORepoConfig,
		logger)
	genesisBlockDataDTORepoConfig := auth_repo.NewGenesisBlockDataDTOConfigurationProvider(authorityAddress)
	genesisBlockDataDTORepo := auth_repo.NewGenesisBlockDataDTORepo(
		genesisBlockDataDTORepoConfig,
		logger)
	blockDataRepo := repo.NewBlockDataRepo(
		logger,
		blockDataDB)
	blockDataDTORepoConfig := auth_repo.NewBlockDataDTOConfigurationProvider(authorityAddress)
	blockDataDTORepo := auth_repo.NewBlockDataDTORepo(
		blockDataDTORepoConfig,
		logger)
	tokRepo := repo.NewTokenRepo(
		logger,
		tokDB)
	nftokenRepo := repo.NewNonFungibleTokenRepo(logger, nftokDB)
	nftAssetRepoConfig := repo.NewNFTAssetRepoConfigurationProvider(nftStorageAddress, "")
	nftAssetRepo := repo.NewNFTAssetRepo(nftAssetRepoConfig, logger)
	mempoolTxDTORepoConfig := auth_repo.NewMempoolTransactionDTOConfigurationProvider(authorityAddress)
	mempoolTxDTORepo := auth_repo.NewMempoolTransactionDTORepo(mempoolTxDTORepoConfig, logger)
	pstxRepo := repo.NewPendingSignedTransactionRepo(logger, pstxDB)
	blockchainSyncStatusRepo := repo.NewBlockchainSyncStatusRepo(logger, memDB)

	// DEPRECATED
	// blockchainStateChangeEventDTOConfigurationProvider := auth_repo.NewBlockchainStateChangeEventDTOConfigurationProvider(authorityAddress)
	// blockchainStateChangeEventDTORepo := auth_repo.NewBlockchainStateChangeEventDTORepo(
	// 	blockchainStateChangeEventDTOConfigurationProvider,
	// 	logger)

	// ------------ Use-Case ------------

	// Storage Transaction
	storageTransactionOpenUseCase := uc_storagetransaction.NewStorageTransactionOpenUseCase(
		logger,
		walletRepo,
		accountRepo,
		genesisBlockDataRepo,
		blockchainStateRepo,
		blockDataRepo,
		tokRepo,
		pstxRepo)
	storageTransactionCommitUseCase := uc_storagetransaction.NewStorageTransactionCommitUseCase(
		logger,
		walletRepo,
		accountRepo,
		genesisBlockDataRepo,
		blockchainStateRepo,
		blockDataRepo,
		tokRepo,
		pstxRepo)
	storageTransactionDiscardUseCase := uc_storagetransaction.NewStorageTransactionDiscardUseCase(
		logger,
		walletRepo,
		accountRepo,
		genesisBlockDataRepo,
		blockchainStateRepo,
		blockDataRepo,
		tokRepo,
		pstxRepo)

	// Wallet Utility
	openHDWalletFromMnemonicUseCase := uc_walletutil.NewOpenHDWalletFromMnemonicUseCase(
		logger,
		keystore)
	encryptWalletUseCase := uc_walletutil.NewEncryptWalletUseCase(
		logger,
		keystore)
	decryptWalletUseCase := uc_walletutil.NewDecryptWalletUseCase(
		logger,
		keystore)
	_ = decryptWalletUseCase
	mnemonicFromEncryptedHDWalletUseCase := uc_walletutil.NewMnemonicFromEncryptedHDWalletUseCase(
		logger,
		keystore)
	privateKeyFromHDWalletUseCase := uc_walletutil.NewPrivateKeyFromHDWalletUseCase(
		logger,
		keystore)

	// // Wallet
	createWalletUseCase := uc_wallet.NewCreateWalletUseCase(
		logger,
		walletRepo)
	getWalletUseCase := uc_wallet.NewGetWalletUseCase(
		logger,
		walletRepo)
	listAllWalletUseCase := uc_wallet.NewListAllWalletUseCase(
		logger,
		walletRepo)
	listAllAddressesWalletUseCase := uc_wallet.NewListAllAddressesWalletUseCase(
		logger,
		walletRepo,
	)

	// Account
	createAccountUseCase := uc_account.NewCreateAccountUseCase(
		logger,
		accountRepo)
	getAccountUseCase := uc_account.NewGetAccountUseCase(
		logger,
		accountRepo)
	getAccountsHashStateUseCase := uc_account.NewGetAccountsHashStateUseCase(
		logger,
		accountRepo)
	upsertAccountUseCase := uc_account.NewUpsertAccountUseCase(
		logger,
		accountRepo)
	accountsFilterByAddressesUseCase := uc_account.NewAccountsFilterByAddressesUseCase(
		logger,
		accountRepo,
	)
	_ = getAccountsHashStateUseCase

	// Blockchain State
	upsertBlockchainStateUseCase := uc_blockchainstate.NewUpsertBlockchainStateUseCase(
		logger,
		blockchainStateRepo)
	getBlockchainStateUseCase := uc_blockchainstate.NewGetBlockchainStateUseCase(
		logger,
		blockchainStateRepo)

	// Blockchain State DTO
	getBlockchainStateDTOFromBlockchainAuthorityUseCase := uc_blockchainstatedto.NewGetBlockchainStateDTOFromBlockchainAuthorityUseCase(
		logger,
		blockchainStateDTORepo)

	// Genesis Block Data
	upsertGenesisBlockDataUseCase := uc_genesisblockdata.NewUpsertGenesisBlockDataUseCase(
		logger,
		genesisBlockDataRepo)
	getGenesisBlockDataUseCase := uc_genesisblockdata.NewGetGenesisBlockDataUseCase(
		logger,
		genesisBlockDataRepo)

	// Genesis Block Data DTO
	getGenesisBlockDataDTOFromBlockchainAuthorityUseCase := uc_genesisblockdatadto.NewGetGenesisBlockDataDTOFromBlockchainAuthorityUseCase(
		logger,
		genesisBlockDataDTORepo)

	// Block Data
	upsertBlockDataUseCase := uc_blockdata.NewUpsertBlockDataUseCase(
		logger,
		blockDataRepo)
	getBlockDataUseCase := uc_blockdata.NewGetBlockDataUseCase(
		logger,
		blockDataRepo)
	getByBlockTransactionTimestampUseCase := uc_blockdata.NewGetByBlockTransactionTimestampUseCase(
		logger,
		blockDataRepo)

	// Block Transactions
	listBlockTransactionsByAddressUseCase := uc_blocktx.NewListBlockTransactionsByAddressUseCase(
		logger,
		blockDataRepo)
	listWithLimitBlockTransactionsByAddressUseCase := uc_blocktx.NewListWithLimitBlockTransactionsByAddressUseCase(
		logger,
		blockDataRepo)

	// Block Data DTO
	getBlockDataDTOFromBlockchainAuthorityUseCase := uc_blockdatadto.NewGetBlockDataDTOFromBlockchainAuthorityUseCase(
		logger,
		blockDataDTORepo)

	// Token
	getTokUseCase := uc_tok.NewGetTokenUseCase(
		logger,
		tokRepo)
	upsertTokenIfPreviousTokenNonceGTEUseCase := uc_tok.NewUpsertTokenIfPreviousTokenNonceGTEUseCase(
		logger,
		tokRepo,
	)
	listTokensByOwnerUseCase := uc_tok.NewListTokensByOwnerUseCase(
		logger,
		tokRepo,
	)
	countTokensByOwnerUseCase := uc_tok.NewCountTokensByOwnerUseCase(
		logger,
		tokRepo,
	)

	// Blockchain State Server Sent Events DTO
	subscribeToBlockchainStateServerSentEventsFromBlockchainAuthorityUseCase := uc_blockchainstate.NewSubscribeToBlockchainStateServerSentEventsFromBlockchainAuthorityUseCase(
		logger,
		blockchainStateServerSentEventsDTORepo)

	// Non-Fungible Token
	getNFTokUseCase := uc_nftok.NewGetNonFungibleTokenUseCase(
		logger,
		nftokenRepo)
	downloadNFTokMetadataUsecase := uc_nftok.NewDownloadMetadataNonFungibleTokenUseCase(
		logger,
		nftAssetRepo)
	downloadNFTokAssetUsecase := uc_nftok.NewDownloadNonFungibleTokenAssetUseCase(
		logger,
		nftAssetRepo)
	upsertNFTokUseCase := uc_nftok.NewUpsertNonFungibleTokenUseCase(
		logger,
		nftokenRepo)
	listNonFungibleTokensWithFilterByTokenIDsyUseCase := uc_nftok.NewListNonFungibleTokensWithFilterByTokenIDsyUseCase(
		logger,
		nftokenRepo)

	// Mempool Transaction DTO
	submitMempoolTransactionDTOToBlockchainAuthorityUseCase := uc_mempooltxdto.NewSubmitMempoolTransactionDTOToBlockchainAuthorityUseCase(
		logger,
		mempoolTxDTORepo,
	)

	// Pending Signed Transaction
	upsertPendingSignedTransactionUseCase := uc_pstx.NewUpsertPendingSignedTransactionUseCase(
		logger,
		pstxRepo)
	listPendingSignedTransactionUseCase := uc_pstx.NewListPendingSignedTransactionUseCase(
		logger,
		pstxRepo)
	deletePendingSignedTransactionUseCase := uc_pstx.NewDeletePendingSignedTransactionUseCase(
		logger,
		pstxRepo)

	// Blockchain Sync Status
	setBlockchainSyncStatusUseCase := uc_blockchainsyncstatus.NewSetBlockchainSyncStatusUseCase(
		logger,
		blockchainSyncStatusRepo)
	getBlockchainSyncStatusUseCase := uc_blockchainsyncstatus.NewGetBlockchainSyncStatusUseCase(
		logger,
		blockchainSyncStatusRepo)

	// ------------ Service ------------

	getBlockchainSyncStatusService := service_blockchainsyncstatus.NewGetBlockchainSyncStatusService(
		logger,
		getBlockchainSyncStatusUseCase,
	)
	getAccountService := service_account.NewGetAccountService(
		logger,
		getAccountUseCase,
	)
	createAccountService := service_account.NewCreateAccountService(
		logger,
		openHDWalletFromMnemonicUseCase,
		privateKeyFromHDWalletUseCase,
		encryptWalletUseCase,
		createWalletUseCase,
		createAccountUseCase,
		getAccountUseCase,
	)
	accountListingByLocalWalletsService := service_account.NewAccountListingByLocalWalletsService(
		logger,
		listAllAddressesWalletUseCase,
		accountsFilterByAddressesUseCase,
	)
	coinTransferService := service_coin.NewCoinTransferService(
		logger,
		storageTransactionOpenUseCase,
		storageTransactionCommitUseCase,
		storageTransactionDiscardUseCase,
		listPendingSignedTransactionUseCase,
		getGenesisBlockDataUseCase,
		upsertPendingSignedTransactionUseCase,
		getAccountUseCase,
		getWalletUseCase,
		mnemonicFromEncryptedHDWalletUseCase,
		privateKeyFromHDWalletUseCase,
		submitMempoolTransactionDTOToBlockchainAuthorityUseCase,
	)
	tokenGetService := service.NewTokenGetService(
		logger,
		getTokUseCase,
	)
	tokenTransferService := service.NewTokenTransferService(
		logger,
		storageTransactionOpenUseCase,
		storageTransactionCommitUseCase,
		storageTransactionDiscardUseCase,
		listPendingSignedTransactionUseCase,
		getGenesisBlockDataUseCase,
		upsertPendingSignedTransactionUseCase,
		getAccountUseCase,
		getWalletUseCase,
		mnemonicFromEncryptedHDWalletUseCase,
		privateKeyFromHDWalletUseCase,
		getTokUseCase,
		submitMempoolTransactionDTOToBlockchainAuthorityUseCase,
	)
	tokenBurnService := service.NewTokenBurnService(
		logger,
		storageTransactionOpenUseCase,
		storageTransactionCommitUseCase,
		storageTransactionDiscardUseCase,
		listPendingSignedTransactionUseCase,
		getGenesisBlockDataUseCase,
		upsertPendingSignedTransactionUseCase,
		getAccountUseCase,
		getWalletUseCase,
		mnemonicFromEncryptedHDWalletUseCase,
		privateKeyFromHDWalletUseCase,
		getTokUseCase,
		submitMempoolTransactionDTOToBlockchainAuthorityUseCase,
	)

	blockchainSyncService := service_blockchain.NewBlockchainSyncWithBlockchainAuthorityService(
		logger,
		getBlockchainSyncStatusUseCase,
		setBlockchainSyncStatusUseCase,
		getGenesisBlockDataUseCase,
		upsertGenesisBlockDataUseCase,
		getGenesisBlockDataDTOFromBlockchainAuthorityUseCase,
		getBlockchainStateUseCase,
		upsertBlockchainStateUseCase,
		getBlockchainStateDTOFromBlockchainAuthorityUseCase,
		getBlockDataUseCase,
		upsertBlockDataUseCase,
		getBlockDataDTOFromBlockchainAuthorityUseCase,
		getAccountUseCase,
		upsertAccountUseCase,
		upsertTokenIfPreviousTokenNonceGTEUseCase,
		deletePendingSignedTransactionUseCase,
	)

	blockchainSyncWithBlockchainAuthorityViaServerSentEventsService := service_blockchain.NewBlockchainSyncWithBlockchainAuthorityViaServerSentEventsService(
		logger,
		blockchainSyncService,
		storageTransactionOpenUseCase,
		storageTransactionCommitUseCase,
		storageTransactionDiscardUseCase,
		getBlockchainStateUseCase,
		subscribeToBlockchainStateServerSentEventsFromBlockchainAuthorityUseCase,
	)

	// DEPRECATED
	// blockchainSyncManagerService := service.NewBlockchainSyncManagerService(
	// 	logger,
	// 	blockchainSyncService,
	// 	storageTransactionOpenUseCase,
	// 	storageTransactionCommitUseCase,
	// 	storageTransactionDiscardUseCase,
	// 	subscribeToBlockchainStateChangeEventsFromBlockchainAuthorityUseCase,
	// )

	getOrDownloadNonFungibleTokenService := service.NewGetOrDownloadNonFungibleTokenService(
		logger,
		getNFTokUseCase,
		getTokUseCase,
		downloadNFTokMetadataUsecase,
		downloadNFTokAssetUsecase,
		upsertNFTokUseCase)

	listBlockTransactionsByAddressService := service_blocktx.NewListBlockTransactionsByAddressService(
		logger,
		listBlockTransactionsByAddressUseCase,
	)
	listWithLimitBlockTransactionsByAddressService := service_blocktx.NewListWithLimitBlockTransactionsByAddressService(
		logger,
		listWithLimitBlockTransactionsByAddressUseCase,
	)
	getByBlockTransactionTimestampService := service_blockdata.NewGetByBlockTransactionTimestampService(
		logger,
		getByBlockTransactionTimestampUseCase,
	)
	blockDataGetByHashService := service_blockdata.NewBlockDataGetByHashService(
		logger,
		getBlockDataUseCase,
	)
	tokenListByOwnerService := service.NewTokenListByOwnerService(
		logger,
		listTokensByOwnerUseCase,
	)
	tokenCountByOwnerService := service.NewTokenCountByOwnerService(
		logger,
		countTokensByOwnerUseCase,
	)
	walletsFilterByLocalService := service.NewWalletsFilterByLocalService(
		logger,
		listAllWalletUseCase,
	)
	listNonFungibleTokensByOwnerService := service.NewListNonFungibleTokensByOwnerService(
		logger,
		listTokensByOwnerUseCase,
		listNonFungibleTokensWithFilterByTokenIDsyUseCase,
		getOrDownloadNonFungibleTokenService,
	)
	pendingSignedTransactionListService := service.NewPendingSignedTransactionListService(
		logger,
		listPendingSignedTransactionUseCase,
	)
	exportWalletService := service.NewExportWalletService(
		logger,
		getAccountUseCase,
		getWalletUseCase,
	)
	importWalletService := service.NewImportWalletService(
		logger,
		getAccountUseCase,
		getWalletUseCase,
		upsertAccountUseCase,
		createWalletUseCase,
	)
	walletRecoveryService := service.NewWalletRecoveryService(
		logger,
		getWalletUseCase,
		mnemonicFromEncryptedHDWalletUseCase,
	)

	// ------------ Interfaces ------------

	a.getBlockchainSyncStatusService = getBlockchainSyncStatusService
	a.getAccountService = getAccountService
	a.createAccountService = createAccountService
	a.accountListingByLocalWalletsService = accountListingByLocalWalletsService
	a.coinTransferService = coinTransferService
	a.tokenGetService = tokenGetService
	a.tokenTransferService = tokenTransferService
	a.tokenBurnService = tokenBurnService
	a.blockchainSyncService = blockchainSyncService
	a.blockchainSyncWithBlockchainAuthorityViaServerSentEventsService = blockchainSyncWithBlockchainAuthorityViaServerSentEventsService
	a.getOrDownloadNonFungibleTokenService = getOrDownloadNonFungibleTokenService
	a.listBlockTransactionsByAddressService = listBlockTransactionsByAddressService
	a.listWithLimitBlockTransactionsByAddressService = listWithLimitBlockTransactionsByAddressService
	a.getByBlockTransactionTimestampService = getByBlockTransactionTimestampService
	a.blockDataGetByHashService = blockDataGetByHashService
	a.tokenListByOwnerService = tokenListByOwnerService
	a.tokenCountByOwnerService = tokenCountByOwnerService
	a.walletsFilterByLocalService = walletsFilterByLocalService
	a.listNonFungibleTokensByOwnerService = listNonFungibleTokensByOwnerService
	a.pendingSignedTransactionListService = pendingSignedTransactionListService
	a.exportWalletService = exportWalletService
	a.importWalletService = importWalletService
	a.walletRecoveryService = walletRecoveryService

	//
	// Execute.
	//
	go func(ctx context.Context, chainid uint16) {
		// When the daemon starts up, the first thing we will do is one-time
		/// full sync with the Global BlockChain Network to get all / any
		// missing parts.
		a.logger.Debug("Starting full-sync...")
		if err := storageTransactionOpenUseCase.Execute(); err != nil {
			log.Fatalf("Failed to open storage transaction: %v\n", err)
		}
		if err := blockchainSyncService.Execute(context.Background(), ComicCoinChainID); err != nil {
			a.logger.Error("Failed full-sync", slog.Any("error", err))
			storageTransactionDiscardUseCase.Execute()
			log.Fatalf("Failed full-sync: %v\n", err)
		}
		if err := storageTransactionCommitUseCase.Execute(); err != nil {
			log.Fatalf("Failed to commit storage transaction: %v\n", err)
		}
		a.logger.Debug("Finished full-sync")

		// Once we have successfully made a copy of the Global BlockChain
		// Network locally, then we will subscribe to waiting and receiving
		// any new changes that occur to update our local copy.
		for {
			a.logger.Debug("Starting partial sync via sse...")
			if err := blockchainSyncWithBlockchainAuthorityViaServerSentEventsService.Execute(context.Background(), chainid); err != nil {
				logger.Error("Failed to manage syncing", slog.Any("error", err))
			}
			a.logger.Debug("Finished partial sync via sse, will restart in 15 seconds...")
			time.Sleep(15 * time.Second)
		}
	}(a.ctx, chainID)

	logger.Info("ComicCoin Wallet is running.")
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

func (a *App) shutdown(ctx context.Context) {
	a.logger.Debug("Shutting down now...")
	defer a.logger.Debug("Shutting down finished")

	// DEVELOPERS NOTE:
	// Before we startup our app, we need to make sure the `data directory` is
	// set for this application by the user, else stop the app startup
	// procedure. This is done on purpose because we need the user to specify
	// the location they want to store instead of having one automatically set.
	preferences := PreferencesInstance()
	dataDir := preferences.DataDirectory
	if dataDir == "" {
		return
	}

}

// IsSyncing returns true or false depending on if the wallet is synching with the current blockchain.
func (a *App) IsSyncing() bool {
	// Defensive code
	if a.getBlockchainSyncStatusService == nil {
		return false
	}

	blockchainSyncStatus, err := a.getBlockchainSyncStatusService.Execute(a.ctx)
	if err != nil {
		log.Fatalf("Failed to get blockchain sync status: %v\n", err)
	}
	return blockchainSyncStatus.IsSynching
}
