package daemon

import (
	"log/slog"
	"os"
	"os/signal"
	"syscall"

	"github.com/spf13/cobra"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/blockchain/hdkeystore"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/emailer/mailgun"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/kmutexutil"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/logger"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/security/blacklist"
	ipcb "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/security/ipcountryblocker"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/security/jwt"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/security/password"
	cloudstorage "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/storage/cloud/s3"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/storage/database/mongodb"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/storage/database/mongodbcache"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/templatedemailer"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/interface/http"
	httphandler "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/interface/http/handler"
	httpmiddle "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/interface/http/middleware"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/interface/task"
	taskhandler "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/interface/task/handler"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/repo"
	sv_attachment "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/service/attachment"
	sv_blockchain "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/service/blockchain"
	sv_comicsubmission "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/service/comicsubmission"
	sv_faucet "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/service/faucet"
	sv_gateway "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/service/gateway"
	sv_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/service/user"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase"
	uc_account "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/account"
	uc_attachment "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/attachment"
	uc_bannedipaddress "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/bannedipaddress"
	uc_blockchainstate "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/blockchainstate"
	uc_blockchainstatechangeeventdto "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/blockchainstatechangeeventdto"
	uc_blockchainstatedto "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/blockchainstatedto"
	uc_blockchainstatesse "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/blockchainstatesse"
	uc_blockdata "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/blockdata"
	uc_blockdatadto "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/blockdatadto"
	uc_blocktx "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/blocktx"
	uc_cloudstorage "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/cloudstorage"
	uc_comicsubmission "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/comicsubmission"
	uc_genesisblockdata "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/genesisblockdata"
	uc_genesisblockdatadto "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/genesisblockdatadto"
	uc_mempooltxdto "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/mempooltxdto"
	uc_tenant "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/tenant"
	uc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/token"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/user"
	uc_usertx "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/usertx"
	uc_wallet "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/wallet"
	uc_walletutil "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/walletutil"
)

func DaemonCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "daemon",
		Short: "Run the ComicCoin Faucet",
		Run: func(cmd *cobra.Command, args []string) {
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
	cfg := config.NewProviderUsingEnvironmentVariables()
	logger.Debug("faucet configuration ready", // For debugging purposes only.
		slog.Any("tenant_id", cfg.App.TenantID),
		slog.Any("wallet_address", cfg.App.WalletAddress))
	kmutex := kmutexutil.NewKMutexProvider()
	dbClient := mongodb.NewProvider(cfg, logger)
	keystore := hdkeystore.NewAdapter()
	passp := password.NewProvider()
	blackp := blacklist.NewProvider()
	jwtp := jwt.NewProvider(cfg)
	cache := mongodbcache.NewCache(cfg, logger, dbClient)
	emailer := mailgun.NewEmailer(cfg, logger)
	templatedEmailer := templatedemailer.NewTemplatedEmailer(logger, emailer)
	cloudstore := cloudstorage.NewCloudStorage(cfg, logger)
	ipcbp := ipcb.NewProvider(cfg, logger)

	//
	// Repository
	//

	banIPAddrRepo := repo.NewBannedIPAddressRepository(cfg, logger, dbClient)
	walletRepo := repo.NewWalletRepository(cfg, logger, dbClient)
	accountRepo := repo.NewAccountRepository(cfg, logger, dbClient)
	tenantRepo := repo.NewTenantRepository(cfg, logger, dbClient)
	userRepo := repo.NewUserRepository(cfg, logger, dbClient)
	userTransactionRepo := repo.NewUserTransactionRepository(cfg, logger, dbClient)
	tokRepo := repo.NewTokenRepository(cfg, logger, dbClient)
	blockchainStateRepo := repo.NewBlockchainStateRepository(cfg, logger, dbClient)
	blockchainStateChangeEventDTOConfigurationProvider := repo.NewBlockchainStateChangeEventDTOConfigurationProvider(cfg.App.AuthorityHTTPAddress)
	blockchainStateChangeEventDTORepo := repo.NewBlockchainStateChangeEventDTORepo(
		blockchainStateChangeEventDTOConfigurationProvider,
		logger)
	blockchainStateServerSentEventsDTOConfigurationProvider := repo.NewBlockchainStateServerSentEventsDTOConfigurationProvider(cfg.App.AuthorityHTTPAddress)
	blockchainStateServerSentEventsDTORepo := repo.NewBlockchainStateServerSentEventsDTORepository(
		blockchainStateServerSentEventsDTOConfigurationProvider,
		logger)
	blockchainStateDTOConfigurationProvider := repo.NewBlockchainStateDTOConfigurationProvider(cfg.App.AuthorityHTTPAddress)
	blockchainStateDTORepo := repo.NewBlockchainStateDTORepo(
		blockchainStateDTOConfigurationProvider,
		logger)
	blockDataRepo := repo.NewBlockDataRepository(
		cfg,
		logger,
		dbClient)
	blockDataDTOConfigurationProvider := repo.NewBlockDataDTOConfigurationProvider(cfg.App.AuthorityHTTPAddress)
	blockDataDTORepo := repo.NewBlockDataDTORepository(
		blockDataDTOConfigurationProvider,
		logger)
	genesisBlockDataRepo := repo.NewGenesisBlockDataRepository(
		cfg,
		logger,
		dbClient)
	genesisBlockDataDTOConfigurationProvider := repo.NewGenesisBlockDataDTOConfigurationProvider(cfg.App.AuthorityHTTPAddress)
	genesisBlockDataDTORepo := repo.NewGenesisBlockDataDTORepository(
		genesisBlockDataDTOConfigurationProvider,
		logger)
	mempoolTransactionDTOConfigurationProvider := repo.NewMempoolTransactionDTOConfigurationProvider(cfg.App.AuthorityHTTPAddress)
	mempoolTxDTORepo := repo.NewMempoolTransactionDTORepo(mempoolTransactionDTOConfigurationProvider, logger)
	attachmentRepo := repo.NewAttachmentRepository(cfg, logger, dbClient)
	comicSubmissionRepo := repo.NewComicSubmissionRepository(cfg, logger, dbClient)

	//
	// Use-case
	//

	// Cloud storage
	cloudStorageSyncUploadUseCase := uc_cloudstorage.NewCloudStorageSyncUploadUseCase(cfg, logger, cloudstore)
	cloudStoragePresignedURLUseCase := uc_cloudstorage.NewCloudStoragePresignedURLUseCase(cfg, logger, cloudstore)
	cloudStorageDeleteUseCase := uc_cloudstorage.NewCloudStorageDeleteUseCase(cfg, logger, cloudstore)

	// Email
	sendUserVerificationEmailUseCase := usecase.NewSendUserVerificationEmailUseCase(cfg, logger, templatedEmailer)

	// Banned IP Addresses
	bannedIPAddressListAllValuesUseCase := uc_bannedipaddress.NewBannedIPAddressListAllValuesUseCase(cfg, logger, banIPAddrRepo)
	createBannedIPAddressUseCase := uc_bannedipaddress.NewCreateBannedIPAddressUseCase(cfg, logger, banIPAddrRepo)

	// Attachment
	createAttachmentUseCase := uc_attachment.NewCreateAttachmentUseCase(cfg, logger, attachmentRepo)
	attachmentGetUseCase := uc_attachment.NewAttachmentGetUseCase(cfg, logger, attachmentRepo)
	attachmentUpdateUseCase := uc_attachment.NewAttachmentUpdateUseCase(cfg, logger, attachmentRepo)
	attachmentListByFilterUseCase := uc_attachment.NewAttachmentListByFilterUseCase(cfg, logger, attachmentRepo)
	attachmentDeleteUseCase := uc_attachment.NewAttachmentDeleteUseCase(cfg, logger, attachmentRepo)

	// Wallet Utils
	privateKeyFromHDWalletUseCase := uc_walletutil.NewPrivateKeyFromHDWalletUseCase(
		cfg,
		logger,
		keystore,
	)

	// Wallet
	getWalletUseCase := uc_wallet.NewGetWalletUseCase(
		cfg,
		logger,
		walletRepo,
	)

	// Account
	createAccountUseCase := uc_account.NewCreateAccountUseCase(
		cfg,
		logger,
		accountRepo)
	_ = createAccountUseCase
	getAccountUseCase := uc_account.NewGetAccountUseCase(
		logger,
		accountRepo)
	getAccountsHashStateUseCase := uc_account.NewGetAccountsHashStateUseCase(
		logger,
		accountRepo)
	_ = getAccountsHashStateUseCase
	upsertAccountUseCase := uc_account.NewUpsertAccountUseCase(
		cfg,
		logger,
		accountRepo)
	accountsFilterByAddressesUseCase := uc_account.NewAccountsFilterByAddressesUseCase(
		logger,
		accountRepo,
	)
	_ = accountsFilterByAddressesUseCase

	// Genesis Block Data
	getGenesisBlockDataUseCase := uc_genesisblockdata.NewGetGenesisBlockDataUseCase(
		cfg,
		logger,
		genesisBlockDataRepo,
	)
	upsertGenesisBlockDataUseCase := uc_genesisblockdata.NewUpsertGenesisBlockDataUseCase(
		logger,
		genesisBlockDataRepo,
	)

	// Genesis Block Data DTO
	getGenesisBlockDataDTOFromBlockchainAuthorityUseCase := uc_genesisblockdatadto.NewGetGenesisBlockDataDTOFromBlockchainAuthorityUseCase(
		logger,
		genesisBlockDataDTORepo)

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
	_ = upsertBlockchainStateUseCase

	// Blockchain State DTO
	getBlockchainStateDTOFromBlockchainAuthorityUseCase := uc_blockchainstatedto.NewGetBlockchainStateDTOFromBlockchainAuthorityUseCase(
		logger,
		blockchainStateDTORepo,
	)

	// Block Data
	getBlockDataUseCase := uc_blockdata.NewGetBlockDataUseCase(
		cfg,
		logger,
		blockDataRepo,
	)
	upsertBlockDataUseCase := uc_blockdata.NewUpsertBlockDataUseCase(
		cfg,
		logger,
		blockDataRepo,
	)
	listBlockTransactionsByAddressUseCase := uc_blocktx.NewListBlockTransactionsByAddressUseCase(
		cfg,
		logger,
		blockDataRepo,
	)
	_ = listBlockTransactionsByAddressUseCase

	// Block Data DTO
	getBlockDataDTOFromBlockchainAuthorityUseCase := uc_blockdatadto.NewGetBlockDataDTOFromBlockchainAuthorityUseCase(
		logger,
		blockDataDTORepo)

	// Token
	getTokenUseCase := uc_token.NewGetTokenUseCase(
		logger,
		tokRepo,
	)
	_ = getTokenUseCase
	getTokensHashStateUseCase := uc_token.NewGetTokensHashStateUseCase(
		logger,
		tokRepo,
	)
	_ = getTokensHashStateUseCase
	upsertTokenIfPreviousTokenNonceGTEUseCase := uc_token.NewUpsertTokenIfPreviousTokenNonceGTEUseCase(
		cfg,
		logger,
		tokRepo,
	)
	listTokensByOwnerUseCase := uc_token.NewListTokensByOwnerUseCase(
		logger,
		tokRepo,
	)
	_ = listTokensByOwnerUseCase

	// Blockchain State DTO
	subscribeToBlockchainStateChangeEventsFromBlockchainAuthorityUseCase := uc_blockchainstatechangeeventdto.NewSubscribeToBlockchainStateChangeEventsFromBlockchainAuthorityUseCase(
		logger,
		blockchainStateChangeEventDTORepo)
	_ = subscribeToBlockchainStateChangeEventsFromBlockchainAuthorityUseCase

	// Blockchain State Server Sent Events DTO
	subscribeToBlockchainStateServerSentEventsFromBlockchainAuthorityUseCase := uc_blockchainstatesse.NewSubscribeToBlockchainStateServerSentEventsFromBlockchainAuthorityUseCase(
		logger,
		blockchainStateServerSentEventsDTORepo)

	// Mempooltx DTO
	submitMempoolTransactionDTOToBlockchainAuthorityUseCase := uc_mempooltxdto.NewSubmitMempoolTransactionDTOToBlockchainAuthorityUseCase(
		logger,
		mempoolTxDTORepo,
	)

	// Tenant
	tenantGetByIDUseCase := uc_tenant.NewTenantGetByIDUseCase(
		cfg,
		logger,
		tenantRepo)
	tenantUpdateUseCase := uc_tenant.NewTenantUpdateUseCase(
		cfg,
		logger,
		tenantRepo)

	// User
	userGetByEmailUseCase := uc_user.NewUserGetByEmailUseCase(
		cfg,
		logger,
		userRepo)
	userCreateUseCase := uc_user.NewUserCreateUseCase(
		cfg,
		logger,
		userRepo)
	userUpdateUseCase := uc_user.NewUserUpdateUseCase(
		cfg,
		logger,
		userRepo)
	userGetBySessionIDUseCase := uc_user.NewUserGetBySessionIDUseCase(
		cfg,
		logger,
		cache)
	userGetByIDUseCase := uc_user.NewUserGetByIDUseCase(
		cfg,
		logger,
		userRepo)
	userGetByVerificationCodeUseCase := uc_user.NewUserGetByVerificationCodeUseCase(
		cfg,
		logger,
		userRepo)
	userCountByFilterUseCase := uc_user.NewUserCountByFilterUseCase(
		cfg,
		logger,
		userRepo)
	userListByFilterUseCase := uc_user.NewUserListByFilterUseCase(
		cfg,
		logger,
		userRepo)

	// User Transaction
	createUserTransactionUseCase := uc_usertx.NewCreateUserTransactionUseCase(
		cfg,
		logger,
		userTransactionRepo,
	)
	userTransactionDeleteUseCase := uc_usertx.NewUserTransactionDeleteUseCase(
		cfg,
		logger,
		userTransactionRepo,
	)
	_ = userTransactionDeleteUseCase
	userTransactionGetUseCase := uc_usertx.NewUserTransactionGetUseCase(
		cfg,
		logger,
		userTransactionRepo,
	)
	userTransactionUpdateUseCase := uc_usertx.NewUserTransactionUpdateUseCase(
		cfg,
		logger,
		userTransactionRepo,
	)

	// Comic Submission.
	comicSubmissionCreateUseCase := uc_comicsubmission.NewComicSubmissionCreateUseCase(
		cfg,
		logger,
		comicSubmissionRepo)
	comicSubmissionGetByIDUseCase := uc_comicsubmission.NewComicSubmissionGetByIDUseCase(
		cfg,
		logger,
		comicSubmissionRepo)
	comicSubmissionListByFilterUseCase := uc_comicsubmission.NewComicSubmissionListByFilterUseCase(
		cfg,
		logger,
		comicSubmissionRepo)
	comicSubmissionCountByFilterUseCase := uc_comicsubmission.NewComicSubmissionCountByFilterUseCase(
		cfg,
		logger,
		comicSubmissionRepo)
	comicSubmissionCountTotalCreatedTodayByUserUseCase := uc_comicsubmission.NewComicSubmissionCountTotalCreatedTodayByUserUseCase(
		cfg,
		logger,
		comicSubmissionRepo)
	comicSubmissionCountCoinsRewardByFilterUseCase := uc_comicsubmission.NewComicSubmissionCountCoinsRewardByFilterUseCase(
		cfg,
		logger,
		comicSubmissionRepo)
	comicSubmissionUpdateUseCase := uc_comicsubmission.NewComicSubmissionUpdateUseCase(
		cfg,
		logger,
		comicSubmissionRepo)
	comicSubmissionTotalCoinsAwardedUseCase := uc_comicsubmission.NewComicSubmissionTotalCoinsAwardedUseCase(
		cfg,
		logger,
		comicSubmissionRepo)

	//
	// Service
	//

	faucetCoinTransferService := sv_faucet.NewFaucetCoinTransferService(
		cfg,
		logger,
		kmutex,
		tenantGetByIDUseCase,
		tenantUpdateUseCase,
		getAccountUseCase,
		upsertAccountUseCase,
		getWalletUseCase,
		privateKeyFromHDWalletUseCase,
		submitMempoolTransactionDTOToBlockchainAuthorityUseCase,
		createUserTransactionUseCase,
	)

	gatewayUserRegisterService := sv_gateway.NewGatewayUserRegisterService(
		cfg,
		logger,
		passp,
		cache,
		jwtp,
		tenantGetByIDUseCase,
		userGetByEmailUseCase,
		userCreateUseCase,
		userUpdateUseCase,
		sendUserVerificationEmailUseCase,
	)

	gatewayLoginService := sv_gateway.NewGatewayLoginService(
		logger,
		passp,
		cache,
		jwtp,
		tenantGetByIDUseCase,
		userGetByEmailUseCase,
		userUpdateUseCase,
	)

	gatewayLogoutService := sv_gateway.NewGatewayLogoutService(
		logger,
		cache,
	)

	gatewayRefreshTokenService := sv_gateway.NewGatewayRefreshTokenService(
		logger,
		cache,
		jwtp,
		userGetByEmailUseCase,
	)

	gatewayProfileGetService := sv_gateway.NewGatewayProfileGetService(
		logger,
		userGetByIDUseCase,
	)
	gatewayProfileUpdateService := sv_gateway.NewGatewayProfileUpdateService(
		logger,
		userGetByIDUseCase,
		userUpdateUseCase,
	)
	gatewayVerifyEmailService := sv_gateway.NewGatewayVerifyEmailService(
		logger,
		kmutex,
		userGetByVerificationCodeUseCase,
		userUpdateUseCase,
	)
	gatewayChangePasswordService := sv_gateway.NewGatewayChangePasswordService(
		logger,
		kmutex,
		passp,
		userGetByIDUseCase,
		userUpdateUseCase,
	)
	gatewayForgotPasswordService := sv_gateway.NewGatewayForgotPasswordService(
		logger,
		templatedEmailer,
		userGetByEmailUseCase,
		userUpdateUseCase,
	)
	gatewayResetPasswordService := sv_gateway.NewGatewayResetPasswordService(
		logger,
		kmutex,
		passp,
		userGetByVerificationCodeUseCase,
		userUpdateUseCase,
	)
	gatewayAddWalletAddressToFaucetService := sv_gateway.NewGatewayAddWalletAddressToFaucetService(
		cfg,
		logger,
		tenantGetByIDUseCase,
		userGetByIDUseCase,
		userUpdateUseCase,
		faucetCoinTransferService,
	)
	gatewayProfileApplyForVerificationService := sv_gateway.NewGatewayApplyProfileForVerificationService(
		logger,
		userGetByIDUseCase,
		userUpdateUseCase,
	)
	_ = gatewayProfileApplyForVerificationService

	blockchainSyncWithBlockchainAuthorityService := sv_blockchain.NewBlockchainSyncWithBlockchainAuthorityService(
		cfg,
		logger,
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
		tenantGetByIDUseCase,
		tenantUpdateUseCase,
		userTransactionGetUseCase,
		userTransactionUpdateUseCase,
	)

	blockchainSyncWithBlockchainAuthorityViaServerSentEventsService := sv_blockchain.NewBlockchainSyncWithBlockchainAuthorityViaServerSentEventsService(
		cfg,
		logger,
		dbClient,
		blockchainSyncWithBlockchainAuthorityService,
		getBlockchainStateUseCase,
		subscribeToBlockchainStateServerSentEventsFromBlockchainAuthorityUseCase,
	)

	// Attachment
	attachmentCreateService := sv_attachment.NewAttachmentCreateService(
		cfg,
		logger,
		cloudStorageSyncUploadUseCase,
		createAttachmentUseCase,
		cloudStoragePresignedURLUseCase,
	)
	attachmentGarbageCollectorService := sv_attachment.NewAttachmentGarbageCollectorService(
		logger,
		attachmentListByFilterUseCase,
		attachmentDeleteUseCase,
		cloudStorageDeleteUseCase,
	)

	// Comic Submission
	comicSubmissionCreateService := sv_comicsubmission.NewComicSubmissionCreateService(
		cfg,
		logger,
		userGetByIDUseCase,
		comicSubmissionCountTotalCreatedTodayByUserUseCase,
		attachmentGetUseCase,
		attachmentUpdateUseCase,
		comicSubmissionCreateUseCase,
	)
	comicSubmissionGetService := sv_comicsubmission.NewComicSubmissionGetService(
		logger,
		comicSubmissionGetByIDUseCase,
	)
	comicSubmissionCountByFilterService := sv_comicsubmission.NewComicSubmissionCountByFilterService(
		logger,
		comicSubmissionCountByFilterUseCase,
	)
	comicSubmissionCountTotalCreatedTodayByUserService := sv_comicsubmission.NewComicSubmissionCountTotalCreatedTodayByUserService(
		logger,
		comicSubmissionCountTotalCreatedTodayByUserUseCase,
	)
	comicSubmissionListByFilterService := sv_comicsubmission.NewComicSubmissionListByFilterService(
		logger,
		cloudStoragePresignedURLUseCase,
		comicSubmissionListByFilterUseCase,
	)
	comicSubmissionCountCoinsRewardByFilterService := sv_comicsubmission.NewComicSubmissionCountCoinsRewardByFilterService(
		logger,
		comicSubmissionCountCoinsRewardByFilterUseCase,
	)
	comicSubmissionJudgeOperationService := sv_comicsubmission.NewComicSubmissionJudgeOperationService(
		cfg,
		logger,
		faucetCoinTransferService,
		cloudStorageDeleteUseCase,
		userGetByIDUseCase,
		userUpdateUseCase,
		createBannedIPAddressUseCase,
		comicSubmissionGetByIDUseCase,
		comicSubmissionUpdateUseCase,
	)
	comicSubmissionTotalCoinsAwardedService := sv_comicsubmission.NewComicSubmissionTotalCoinsAwardedService(
		logger,
		comicSubmissionTotalCoinsAwardedUseCase,
	)

	// User
	userCountJoinedThisWeekService := sv_user.NewUserCountJoinedThisWeekService(
		logger,
		userCountByFilterUseCase,
	)
	userListByFilterService := sv_user.NewUserListByFilterService(
		logger,
		cloudStoragePresignedURLUseCase,
		userListByFilterUseCase,
	)
	userProfileVerificationJudgeOperationService := sv_user.NewUserProfileVerificationJudgeOperationService(
		logger,
		userGetByIDUseCase,
		userUpdateUseCase,
	)

	// Faucet
	faucetBalanceService := sv_faucet.NewFaucetBalanceService(
		cfg,
		logger,
		kmutex,
		getAccountUseCase,
	)

	//
	// Interface.
	//

	// --- Task Manager --- //
	attachmentGarbageCollectorTask := taskhandler.NewAttachmentGarbageCollectorTaskHandler(
		cfg,
		logger,
		dbClient,
		attachmentGarbageCollectorService,
	)
	blockchainSyncWithBlockchainAuthorityTaskHandler := taskhandler.NewBlockchainSyncWithBlockchainAuthorityTaskHandler(
		cfg,
		logger,
		dbClient,
		blockchainSyncWithBlockchainAuthorityService,
	)
	blockchainSyncWithBlockchainAuthorityViaServerSentEventsTaskHandler := taskhandler.NewBlockchainSyncWithBlockchainAuthorityViaServerSentEventsTaskHandler(
		cfg,
		logger,
		dbClient,
		blockchainSyncWithBlockchainAuthorityViaServerSentEventsService,
	)
	taskManager := task.NewTaskManager(
		cfg,
		logger,
		attachmentGarbageCollectorTask,
		blockchainSyncWithBlockchainAuthorityTaskHandler,
		blockchainSyncWithBlockchainAuthorityViaServerSentEventsTaskHandler,
	)

	// --- HTTP --- //
	getVersionHTTPHandler := httphandler.NewGetVersionHTTPHandler(
		logger)
	getHealthCheckHTTPHandler := httphandler.NewGetHealthCheckHTTPHandler(
		logger)
	gatewayUserRegisterHTTPHandler := httphandler.NewGatewayUserRegisterHTTPHandler(
		logger,
		dbClient,
		gatewayUserRegisterService,
	)
	gatewayLoginHTTPHandler := httphandler.NewGatewayLoginHTTPHandler(
		logger,
		dbClient,
		gatewayLoginService,
	)
	gatewayLogoutHTTPHandler := httphandler.NewGatewayLogoutHTTPHandler(
		logger,
		dbClient,
		gatewayLogoutService,
	)
	gatewayRefreshTokenHTTPHandler := httphandler.NewGatewayRefreshTokenHTTPHandler(
		logger,
		dbClient,
		gatewayRefreshTokenService,
	)
	gatewayProfileDetailHTTPHandler := httphandler.NewGatewayProfileDetailHTTPHandler(
		logger,
		dbClient,
		gatewayProfileGetService,
	)
	gatewayProfileUpdateHTTPHandler := httphandler.NewGatewayProfileUpdateHTTPHandler(
		logger,
		dbClient,
		gatewayProfileUpdateService,
	)
	gatewayVerifyHTTPHandler := httphandler.NewGatewayVerifyHTTPHandler(
		logger,
		dbClient,
		gatewayVerifyEmailService,
	)
	gatewayChangePasswordHTTPHandler := httphandler.NewGatewayChangePasswordHTTPHandler(
		logger,
		dbClient,
		gatewayChangePasswordService,
	)
	gatewayForgotPasswordHTTPHandler := httphandler.NewGatewayForgotPasswordHTTPHandler(
		logger,
		dbClient,
		gatewayForgotPasswordService,
	)
	gatewayResetPasswordHTTPHandler := httphandler.NewGatewayResetPasswordHTTPHandler(
		logger,
		dbClient,
		gatewayResetPasswordService,
	)
	gatewayProfileWalletAddressHTTPHandler := httphandler.NewGatewayProfileWalletAddressHTTPHandler(
		logger,
		dbClient,
		gatewayAddWalletAddressToFaucetService,
	)
	gatewayProfileApplyForVerificationHTTPHandler := httphandler.NewGatewayApplyProfileForVerificationHTTPHandler(
		logger,
		dbClient,
		gatewayProfileApplyForVerificationService,
	)
	attachmentCreateHTTPHandler := httphandler.NewAttachmentCreateHTTPHandler(
		logger,
		dbClient,
		attachmentCreateService,
	)
	comicSubmissionCreateHTTPHandler := httphandler.NewComicSubmissionCreateHTTPHandler(
		logger,
		dbClient,
		comicSubmissionCreateService,
	)
	comicSubmissionGetHTTPHandler := httphandler.NewComicSubmissionGetHTTPHandler(
		logger,
		dbClient,
		comicSubmissionGetService,
	)
	comicSubmissionListByFilterHTTPHandler := httphandler.NewComicSubmissionListByFilterHTTPHandler(
		logger,
		dbClient,
		comicSubmissionListByFilterService,
	)
	comicSubmissionCountByFilterHTTPHandler := httphandler.NewComicSubmissionCountByFilterHTTPHandler(
		logger,
		dbClient,
		comicSubmissionCountByFilterService,
	)
	comicSubmissionCountTotalCreatedTodayByUserHTTPHandler := httphandler.NewComicSubmissionCountTotalCreatedTodayByUserHTTPHandler(
		logger,
		dbClient,
		comicSubmissionCountTotalCreatedTodayByUserService,
	)
	comicSubmissionCountCoinsRewardByFilterHTTPHandler := httphandler.NewComicSubmissionCountCoinsRewardByFilterHTTPHandler(
		logger,
		dbClient,
		comicSubmissionCountCoinsRewardByFilterService,
	)
	comicSubmissionJudgeOperationHTTPHandler := httphandler.NewComicSubmissionJudgeOperationHTTPHandler(
		logger,
		dbClient,
		comicSubmissionJudgeOperationService,
	)
	comicSubmissionTotalCoinsAwardedHTTPHandler := httphandler.NewComicSubmissionTotalCoinsAwardedHTTPHandler(
		logger,
		dbClient,
		comicSubmissionTotalCoinsAwardedService,
	)
	userCountJoinedThisWeekHTTPHandler := httphandler.NewUserCountJoinedThisWeekHTTPHandler(
		logger,
		dbClient,
		userCountJoinedThisWeekService,
	)
	userListByFilterHTTPHandler := httphandler.NewUserListByFilterHTTPHandler(
		logger,
		dbClient,
		userListByFilterService,
	)
	userProfileVerificationJudgeOperationHTTPHandler := httphandler.NewUserProfileVerificationJudgeOperationHTTPHandler(
		logger,
		dbClient,
		userProfileVerificationJudgeOperationService,
	)
	faucetBalanceHTTPHandler := httphandler.NewFaucetBalanceHTTPHandler(
		logger,
		dbClient,
		faucetBalanceService,
	)
	httpMiddleware := httpmiddle.NewMiddleware(
		logger,
		blackp,
		ipcbp,
		jwtp,
		userGetBySessionIDUseCase,
		bannedIPAddressListAllValuesUseCase,
	)
	httpServ := http.NewHTTPServer(
		cfg,
		logger,
		httpMiddleware,
		getVersionHTTPHandler,
		getHealthCheckHTTPHandler,
		gatewayUserRegisterHTTPHandler,
		gatewayLoginHTTPHandler,
		gatewayLogoutHTTPHandler,
		gatewayRefreshTokenHTTPHandler,
		gatewayProfileDetailHTTPHandler,
		gatewayProfileUpdateHTTPHandler,
		gatewayVerifyHTTPHandler,
		gatewayChangePasswordHTTPHandler,
		gatewayForgotPasswordHTTPHandler,
		gatewayResetPasswordHTTPHandler,
		gatewayProfileWalletAddressHTTPHandler,
		gatewayProfileApplyForVerificationHTTPHandler,
		attachmentCreateHTTPHandler,
		comicSubmissionCreateHTTPHandler,
		comicSubmissionGetHTTPHandler,
		comicSubmissionListByFilterHTTPHandler,
		comicSubmissionCountByFilterHTTPHandler,
		comicSubmissionCountCoinsRewardByFilterHTTPHandler,
		comicSubmissionTotalCoinsAwardedHTTPHandler,
		comicSubmissionCountTotalCreatedTodayByUserHTTPHandler,
		comicSubmissionJudgeOperationHTTPHandler,
		userCountJoinedThisWeekHTTPHandler,
		userListByFilterHTTPHandler,
		faucetBalanceHTTPHandler,
		userProfileVerificationJudgeOperationHTTPHandler,
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

	go httpServ.Run()
	defer httpServ.Shutdown()
	go taskManager.Run()
	defer taskManager.Shutdown()

	logger.Info("ComicCoin Faucet is running.")

	<-done
}
