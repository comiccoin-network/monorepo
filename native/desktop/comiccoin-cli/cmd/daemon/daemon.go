package daemon

import (
	"context"
	"log"
	"log/slog"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/blockchain/hdkeystore"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/logger"
	disk "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/storage/disk/leveldb"
	inmemory "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/storage/memory/inmemory"
	auth_repo "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/repo"
	uc_blockchainstatedto "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/blockchainstatedto"
	uc_blockdatadto "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/blockdatadto"
	uc_genesisblockdatadto "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/genesisblockdatadto"
	uc_mempooltxdto "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/mempooltxdto"
	"github.com/spf13/cobra"

	pref "github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/common/preferences"
	"github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/interface/rpc"
	"github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/repo"
	service_account "github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/service/account"
	service_blockchain "github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/service/blockchain"
	service_blockdata "github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/service/blockdata"
	service_blocktx "github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/service/blocktx"
	service_coin "github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/service/coin"
	service_nftok "github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/service/nftok"
	service_tok "github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/service/tok"
	service_wallet "github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/service/wallet"
	uc_account "github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/usecase/account"
	uc_blockchainstate "github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/usecase/blockchainstate"
	uc_blockchainsyncstatus "github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/usecase/blockchainsyncstatus"
	uc_blockdata "github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/usecase/blockdata"
	uc_blocktx "github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/usecase/blocktx"
	uc_genesisblockdata "github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/usecase/genesisblockdata"
	uc_nftok "github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/usecase/nftok"
	uc_pstx "github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/usecase/pstx"
	uc_storagetransaction "github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/usecase/storagetransaction"
	uc_tok "github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/usecase/tok"
	uc_wallet "github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/usecase/wallet"
	uc_walletutil "github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/usecase/walletutil"
)

var (
	preferences *pref.Preferences
)

// Command line argument flags
var (
	flagDataDirectory     string
	flagChainID           uint16
	flagAuthorityAddress  string
	flagNFTStorageAddress string
)

// Initialize function will be called when every command gets called.
func init() {
	preferences = pref.PreferencesInstance()
}

func DaemonCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "daemon",
		Short: "Runs a full node on your machine which will automatically synchronize the local blockchain with the Global Blockchain Network on any new changes.",
		Run: func(cmd *cobra.Command, args []string) {
			// Developers Note:
			// Before executing this command, check to ensure the user has
			// configured our app before proceeding.
			preferences.RunFatalIfHasAnyMissingFields()

			// Load up our operating system interaction handlers, more specifically
			// signals. The OS sends our application various signals based on the
			// OS's state, we want to listen into the termination signals.
			done := make(chan os.Signal, 1)
			signal.Notify(done, os.Interrupt, syscall.SIGINT, syscall.SIGTERM, syscall.SIGKILL, syscall.SIGUSR1)

			go doRunDaemonCmd()

			<-done
		},
	}
	cmd.Flags().StringVar(&flagDataDirectory, "data-directory", preferences.DataDirectory, "The data directory to save to")
	cmd.Flags().Uint16Var(&flagChainID, "chain-id", preferences.ChainID, "The blockchain to sync with")
	cmd.Flags().StringVar(&flagAuthorityAddress, "authority-address", preferences.AuthorityAddress, "The BlockChain authority address to connect to")
	cmd.Flags().StringVar(&flagNFTStorageAddress, "nftstorage-address", preferences.NFTStorageAddress, "The NFT storage service adress to connect to")

	return cmd
}

func doRunDaemonCmd() {
	// ------ Common ------

	logger := logger.NewProvider()
	keystore := hdkeystore.NewAdapter()
	memDB := inmemory.NewInMemoryStorage(logger)
	walletDB := disk.NewDiskStorage(flagDataDirectory, "wallet", logger)
	accountDB := disk.NewDiskStorage(flagDataDirectory, "account", logger)
	genesisBlockDataDB := disk.NewDiskStorage(flagDataDirectory, "genesis_block_data", logger)
	blockchainStateDB := disk.NewDiskStorage(flagDataDirectory, "blockchain_state", logger)
	blockDataDB := disk.NewDiskStorage(flagDataDirectory, "block_data", logger)
	tokDB := disk.NewDiskStorage(flagDataDirectory, "token", logger)
	nftokDB := disk.NewDiskStorage(flagDataDirectory, "non_fungible_token", logger)
	pstxDB := disk.NewDiskStorage(flagDataDirectory, "pending_signed_transaction", logger)

	// ------------ Repo ------------

	blockchainStateServerSentEventsDTOConfigurationProvider := repo.NewBlockchainStateServerSentEventsDTOConfigurationProvider(flagAuthorityAddress)
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
	blockchainStateDTORepoConfig := auth_repo.NewBlockchainStateDTOConfigurationProvider(flagAuthorityAddress)
	blockchainStateDTORepo := auth_repo.NewBlockchainStateDTORepo(
		blockchainStateDTORepoConfig,
		logger)
	genesisBlockDataDTORepoConfig := auth_repo.NewGenesisBlockDataDTOConfigurationProvider(flagAuthorityAddress)
	genesisBlockDataDTORepo := auth_repo.NewGenesisBlockDataDTORepo(
		genesisBlockDataDTORepoConfig,
		logger)
	blockDataRepo := repo.NewBlockDataRepo(
		logger,
		blockDataDB)
	blockDataDTORepoConfig := auth_repo.NewBlockDataDTOConfigurationProvider(flagAuthorityAddress)
	blockDataDTORepo := auth_repo.NewBlockDataDTORepo(
		blockDataDTORepoConfig,
		logger)
	tokRepo := repo.NewTokenRepo(
		logger,
		tokDB)
	// blockchainStateChangeEventDTOConfigurationProvider := auth_repo.NewBlockchainStateChangeEventDTOConfigurationProvider(flagAuthorityAddress)
	// blockchainStateChangeEventDTORepo := auth_repo.NewBlockchainStateChangeEventDTORepo(
	// 	blockchainStateChangeEventDTOConfigurationProvider,
	// 	logger)
	nftokenRepo := repo.NewNonFungibleTokenRepo(logger, nftokDB)
	nftAssetRepoConfig := repo.NewNFTAssetRepoConfigurationProvider(flagNFTStorageAddress, "")
	nftAssetRepo := repo.NewNFTAssetRepo(nftAssetRepoConfig, logger)
	mempoolTxDTORepoConfig := auth_repo.NewMempoolTransactionDTOConfigurationProvider(flagAuthorityAddress)
	mempoolTxDTORepo := auth_repo.NewMempoolTransactionDTORepo(mempoolTxDTORepoConfig, logger)
	pstxRepo := repo.NewPendingSignedTransactionRepo(logger, pstxDB)
	blockchainSyncStatusRepo := repo.NewBlockchainSyncStatusRepo(logger, memDB)

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

	// Wallet
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
	_ = listAllWalletUseCase

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
	tokenGetService := service_tok.NewTokenGetService(
		logger,
		getTokUseCase,
	)
	tokenTransferService := service_tok.NewTokenTransferService(
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
	tokenBurnService := service_tok.NewTokenBurnService(
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
	// _ = blockchainSyncManagerService // DEPRECATED

	getOrDownloadNonFungibleTokenService := service_nftok.NewGetOrDownloadNonFungibleTokenService(
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
	getByBlockTransactionTimestampService := service_blockdata.NewGetByBlockTransactionTimestampService(
		logger,
		getByBlockTransactionTimestampUseCase,
	)
	blockDataGetByHashService := service_blockdata.NewBlockDataGetByHashService(
		logger,
		getBlockDataUseCase,
	)
	tokenListByOwnerService := service_tok.NewTokenListByOwnerService(
		logger,
		listTokensByOwnerUseCase,
	)
	exportWalletService := service_wallet.NewExportWalletService(
		logger,
		getAccountUseCase,
		getWalletUseCase,
	)
	importWalletService := service_wallet.NewImportWalletService(
		logger,
		getAccountUseCase,
		getWalletUseCase,
		upsertAccountUseCase,
		createWalletUseCase,
	)

	// ------------ Interfaces ------------

	rpcServerConfigurationProvider := rpc.NewRPCServerConfigurationProvider("localhost", "2233")
	rpcServer := rpc.NewRPCServer(
		rpcServerConfigurationProvider,
		logger,
		getAccountService,
		createAccountService,
		accountListingByLocalWalletsService,
		coinTransferService,
		tokenGetService,
		tokenTransferService,
		tokenBurnService,
		getOrDownloadNonFungibleTokenService,
		listBlockTransactionsByAddressService,
		getByBlockTransactionTimestampService,
		blockDataGetByHashService,
		tokenListByOwnerService,
		exportWalletService,
		importWalletService,
	)

	//
	// Execute.
	//

	// When the daemon starts up, the first thing we will do is one-time
	/// full sync with the Global BlockChain Network to get all / any
	// missing parts.
	logger.Debug("Starting full-sync...")
	if err := storageTransactionOpenUseCase.Execute(); err != nil {
		log.Fatalf("Failed to open storage transaction: %v\n", err)
	}
	if err := blockchainSyncService.Execute(context.Background(), flagChainID); err != nil {
		logger.Error("Failed full-sync", slog.Any("error", err))
		storageTransactionDiscardUseCase.Execute()
		log.Fatalf("Failed full-sync: %v\n", err)
	}
	if err := storageTransactionCommitUseCase.Execute(); err != nil {
		log.Fatalf("Failed to commit storage transaction: %v\n", err)
	}
	logger.Debug("Finished full-sync")

	go func() {
		// Once we have successfully made a copy of the Global BlockChain
		// Network locally, then we will subscribe to waiting and receiving
		// any new changes that occur to update our local copy.

		for {
			logger.Debug("Starting partial sync via sse...")
			if err := blockchainSyncWithBlockchainAuthorityViaServerSentEventsService.Execute(context.Background(), flagChainID); err != nil {
				logger.Error("Failed to manage syncing", slog.Any("error", err))
			}
			logger.Debug("Finished partial sync via sse, will restart in 15 seconds...")
			time.Sleep(15 * time.Second)
		}
	}()

	go func() {
		rpcServer.Run("localhost", "2233")
		defer rpcServer.Shutdown()
	}()

	logger.Info("ComicCoin CLI daemon is running.")
}
