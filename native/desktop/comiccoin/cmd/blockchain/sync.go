package blockchain

import (
	"context"
	"log"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/logger"
	disk "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/storage/disk/leveldb"
	inmemory "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/storage/memory/inmemory"
	auth_repo "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/repo"
	uc_blockchainstatedto "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/blockchainstatedto"
	uc_blockdatadto "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/blockdatadto"
	uc_genesisblockdatadto "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/genesisblockdatadto"
	"github.com/spf13/cobra"

	"github.com/comiccoin-network/monorepo/native/desktop/comiccoin/repo"
	"github.com/comiccoin-network/monorepo/native/desktop/comiccoin/service"
	uc_account "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/usecase/account"
	uc_blockchainstate "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/usecase/blockchainstate"
	uc_blockchainsyncstatus "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/usecase/blockchainsyncstatus"
	uc_blockdata "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/usecase/blockdata"
	uc_genesisblockdata "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/usecase/genesisblockdata"
	uc_pstx "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/usecase/pstx"
	uc_storagetransaction "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/usecase/storagetransaction"
	uc_tok "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/usecase/tok"
)

// Command line argument flags
var (
	flagDataDirectory     string
	flagChainID           uint16
	flagAuthorityAddress  string
	flagNFTStorageAddress string
)

func BlockchainSyncCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "sync",
		Short: "Execute command to manually synchronize the local blockchain with the Blockchain network.",
		Run: func(cmd *cobra.Command, args []string) {
			if err := doRunBlockchainSyncCmd(); err != nil {
				log.Fatalf("Failed to sync blockchain: %v\n", err)
			}
		},
	}

	cmd.Flags().StringVar(&flagDataDirectory, "data-directory", preferences.DataDirectory, "The data directory to save to")
	cmd.Flags().Uint16Var(&flagChainID, "chain-id", preferences.ChainID, "The blockchain to sync with")
	cmd.Flags().StringVar(&flagAuthorityAddress, "authority-address", preferences.AuthorityAddress, "The BlockChain authority address to connect to")
	cmd.Flags().StringVar(&flagNFTStorageAddress, "nftstorage-address", preferences.NFTStorageAddress, "The NFT storage service adress to connect to")

	return cmd
}

func doRunBlockchainSyncCmd() error {
	// ------ Common ------

	logger := logger.NewProvider()
	logger.Info("Syncing blockchain...",
		slog.Any("authority_address", flagAuthorityAddress))

	// ------ Database -----
	memDB := inmemory.NewInMemoryStorage(logger)
	walletDB := disk.NewDiskStorage(flagDataDirectory, "wallet", logger)
	accountDB := disk.NewDiskStorage(flagDataDirectory, "account", logger)
	genesisBlockDataDB := disk.NewDiskStorage(flagDataDirectory, "genesis_block_data", logger)
	blockchainStateDB := disk.NewDiskStorage(flagDataDirectory, "blockchain_state", logger)
	blockDataDB := disk.NewDiskStorage(flagDataDirectory, "block_data", logger)
	tokenRepo := disk.NewDiskStorage(flagDataDirectory, "token", logger)
	pstxDB := disk.NewDiskStorage(flagDataDirectory, "pending_signed_transaction", logger)

	// ------------ Repo ------------

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
		tokenRepo)
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

	// Block Data DTO
	getBlockDataDTOFromBlockchainAuthorityUseCase := uc_blockdatadto.NewGetBlockDataDTOFromBlockchainAuthorityUseCase(
		logger,
		blockDataDTORepo)

	// Account
	getAccountUseCase := uc_account.NewGetAccountUseCase(
		logger,
		accountRepo,
	)
	upsertAccountUseCase := uc_account.NewUpsertAccountUseCase(
		logger,
		accountRepo,
	)

	// Token
	upsertTokenIfPreviousTokenNonceGTEUseCase := uc_tok.NewUpsertTokenIfPreviousTokenNonceGTEUseCase(
		logger,
		tokRepo,
	)

	// Pending Signed Transaction
	upsertPendingSignedTransactionUseCase := uc_pstx.NewUpsertPendingSignedTransactionUseCase(
		logger,
		pstxRepo)
	_ = upsertPendingSignedTransactionUseCase
	listPendingSignedTransactionUseCase := uc_pstx.NewListPendingSignedTransactionUseCase(
		logger,
		pstxRepo)
	_ = listPendingSignedTransactionUseCase
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

	blockchainSyncService := service.NewBlockchainSyncWithBlockchainAuthorityService(
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

	// ------------ Execute ------------

	ctx := context.Background()
	if err := storageTransactionOpenUseCase.Execute(); err != nil {
		storageTransactionDiscardUseCase.Execute()
		log.Fatalf("Failed to open storage transaction: %v\n", err)
	}

	if err := blockchainSyncService.Execute(ctx, flagChainID); err != nil {
		storageTransactionDiscardUseCase.Execute()
		log.Fatalf("Failed to sync blockchain: %v\n", err)
	}

	if err := storageTransactionCommitUseCase.Execute(); err != nil {
		storageTransactionDiscardUseCase.Execute()
		log.Fatalf("Failed to open storage transaction: %v\n", err)
	}

	logger.Info("Finished syncing blockchain",
		slog.Any("authority_address", flagAuthorityAddress))
	return nil
}
