package publicfaucet

import (
	"context"
	"log"
	"log/slog"

	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	r_mempooltxdto "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/repo"
	uc_mempooltxdto "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/mempooltxdto"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/blockchain/hdkeystore"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/distributedmutex"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/emailer/mailgun"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/blacklist"
	ipcb "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/ipcountryblocker"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/jwt"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/password"
	mongodb_cache "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/storage/database/mongodbcache"
	redis_cache "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/storage/memory/redis"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/templatedemailer"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/interface/http"
	httpserver "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/interface/http"
	http_claimcoins "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/interface/http/claimcoins"
	http_dashboard "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/interface/http/dashboard"
	http_faucet "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/interface/http/faucet"
	http_gateway "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/interface/http/gateway"
	http_hello "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/interface/http/hello"
	http_me "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/interface/http/me"
	httpmiddle "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/interface/http/middleware"
	http_transactions "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/interface/http/transactions"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/interface/task"
	tsk_faucet "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/interface/task/faucet"
	r_banip "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/repo/bannedipaddress"
	r_faucet "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/repo/faucet"
	r_remoteaccountbalance "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/repo/remoteaccountbalance"
	r_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/repo/user"
	svc_claimcoins "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/service/claimcoins"
	sv_dashboard "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/service/dashboard"
	svc_faucet "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/service/faucet"
	svc_gateway "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/service/gateway"
	svc_hello "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/service/hello"
	svc_me "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/service/me"
	svc_transactions "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/service/transactions"
	uc_bannedipaddress "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/usecase/bannedipaddress"
	uc_emailer "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/usecase/emailer"
	uc_faucet "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/usecase/faucet"
	uc_remoteaccountbalance "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/usecase/remoteaccountbalance"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/usecase/user"
	uc_walletutil "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/usecase/walletutil"
)

type PublicFaucetModule struct {
	config               *config.Configuration
	logger               *slog.Logger
	dbClient             *mongo.Client
	keystore             hdkeystore.KeystoreAdapter
	passp                password.Provider
	jwtp                 jwt.Provider
	blackp               blacklist.Provider
	mongodbCacheProvider mongodb_cache.Cacher
	dmutex               distributedmutex.Adapter
	ipcbp                ipcb.Provider
	httpServer           httpserver.HTTPServer
	taskManager          task.TaskManager
}

func NewModule(
	cfg *config.Configuration,
	logger *slog.Logger,
	dbClient *mongo.Client,
	keystore hdkeystore.KeystoreAdapter,
	passp password.Provider,
	jwtp jwt.Provider,
	blackp blacklist.Provider,
	rediscachep redis_cache.Cacher,
	dmutex distributedmutex.Adapter,
	ipcbp ipcb.Provider,
) *PublicFaucetModule {

	////
	//// Specific
	////

	mongodbCacheConfigurationProvider := mongodb_cache.NewCacheConfigurationProvider(cfg.DB.PublicFaucetName)
	mongodbCacheProvider := mongodb_cache.NewCache(mongodbCacheConfigurationProvider, logger, dbClient)
	emailer := mailgun.NewEmailer(cfg, logger)
	templatedEmailer := templatedemailer.NewTemplatedEmailer(logger, emailer)

	////
	//// Repository
	////

	banIPAddrRepo := r_banip.NewRepository(cfg, logger, dbClient)
	userRepo := r_user.NewRepository(cfg, logger, dbClient)
	faucetRepo := r_faucet.NewRepository(cfg, logger, dbClient)
	remoteaccountbalance := r_remoteaccountbalance.NewRepository(cfg, logger)

	// (External package)
	mempoolTransactionDTOConfigurationProvider := r_mempooltxdto.NewMempoolTransactionDTOConfigurationProvider(cfg.Blockchain.AuthorityServerURL)
	mempoolTxDTORepo := r_mempooltxdto.NewMempoolTransactionDTORepo(mempoolTransactionDTOConfigurationProvider, logger)

	////
	//// Use-case
	////

	// --- Emailer ---

	sendUserVerificationEmailUseCase := uc_emailer.NewSendUserVerificationEmailUseCase(
		cfg,
		logger,
		templatedEmailer,
	)
	sendUserPasswordResetEmailUseCase := uc_emailer.NewSendUserPasswordResetEmailUseCase(
		cfg,
		logger,
		templatedEmailer,
	)

	// --- Banned IP Addresses ---

	bannedIPAddressListAllValuesUseCase := uc_bannedipaddress.NewBannedIPAddressListAllValuesUseCase(
		cfg,
		logger,
		banIPAddrRepo,
	)

	// --- Users ---

	userGetBySessionIDUseCase := uc_user.NewUserGetBySessionIDUseCase(
		cfg,
		logger,
		mongodbCacheProvider,
	)
	userGetByEmailUseCase := uc_user.NewUserGetByEmailUseCase(
		cfg,
		logger,
		userRepo,
	)
	userGetByVerificationCodeUseCase := uc_user.NewUserGetByVerificationCodeUseCase(
		cfg,
		logger,
		userRepo,
	)
	userGetByIDUseCase := uc_user.NewUserGetByIDUseCase(
		cfg,
		logger,
		userRepo,
	)
	userCreateUseCase := uc_user.NewUserCreateUseCase(
		cfg,
		logger,
		userRepo,
	)
	userUpdateUseCase := uc_user.NewUserUpdateUseCase(
		cfg,
		logger,
		userRepo,
	)
	_ = userGetByIDUseCase
	userGetByWalletAddressUseCase := uc_user.NewUserGetByWalletAddressUseCase(
		logger,
		userRepo,
	)
	userDeleteByIDUseCase := uc_user.NewUserDeleteByIDUseCase(
		cfg,
		logger,
		userRepo,
	)

	// --- Private Key ---

	privateKeyFromHDWalletUseCase := uc_walletutil.NewPrivateKeyFromHDWalletUseCase(
		cfg,
		logger,
		keystore,
	)

	// --- Faucet ---

	createFaucetUseCase := uc_faucet.NewCreateFaucetUseCase(
		cfg,
		logger,
		faucetRepo,
	)
	getFaucetByChainIDUseCase := uc_faucet.NewGetFaucetByChainIDUseCase(
		cfg,
		logger,
		faucetRepo,
	)
	faucetUpdateByChainIDUseCase := uc_faucet.NewFaucetUpdateByChainIDUseCase(
		cfg,
		logger,
		faucetRepo,
	)
	checkIfFaucetExistsByChainIDUseCase := uc_faucet.NewCheckIfFaucetExistsByChainIDUseCase(
		cfg,
		logger,
		faucetRepo,
	)
	createIfFaucetDNEForMainNetBlockchainUseCase := uc_faucet.NewCreateIfFaucetDNEForMainNetBlockchainUseCase(
		cfg,
		logger,
		faucetRepo,
	)
	_ = createFaucetUseCase
	_ = checkIfFaucetExistsByChainIDUseCase

	// --- RemoteAccountBalance ---

	fetchRemoteAccountBalanceFromAuthorityUseCase := uc_remoteaccountbalance.NewFetchRemoteAccountBalanceFromAuthorityUseCase(
		logger,
		remoteaccountbalance,
	)

	// --- Mempooltx DTO (Exteranl package)---
	submitMempoolTransactionDTOToBlockchainAuthorityUseCase := uc_mempooltxdto.NewSubmitMempoolTransactionDTOToBlockchainAuthorityUseCase(
		logger,
		mempoolTxDTORepo,
	)

	////
	//// Service
	////

	// --- Hello ---

	getHelloService := svc_hello.NewHelloService(
		cfg,
		logger,
	)

	// --- Me ---

	getMeServiceImpl := svc_me.NewGetMeService(
		cfg,
		logger,
		userGetByIDUseCase,
		userCreateUseCase,
		userUpdateUseCase,
		getFaucetByChainIDUseCase,
		faucetUpdateByChainIDUseCase,
	)

	meConnectWalletService := svc_me.NewMeConnectWalletService(
		cfg,
		logger,
		userGetByIDUseCase,
		userUpdateUseCase,
		userGetByWalletAddressUseCase,
	)
	updateMeService := svc_me.NewUpdateMeService(
		cfg,
		logger,
		userGetByWalletAddressUseCase,
		userGetByIDUseCase,
		userUpdateUseCase,
	)

	deleteMeService := svc_me.NewDeleteMeService(
		cfg,
		logger,
		passp,
		userGetByIDUseCase,
		userDeleteByIDUseCase,
	)

	// --- Faucet ---

	getFaucetService := svc_faucet.NewGetFaucetService(
		cfg,
		logger,
		getFaucetByChainIDUseCase,
	)

	getPublicFaucetPrivateKeyService := svc_faucet.NewGetPublicFaucetPrivateKeyService(
		cfg,
		logger,
		privateKeyFromHDWalletUseCase,
	)

	updateFaucetBalanceByAuthorityService := svc_faucet.NewUpdateFaucetBalanceByAuthorityService(
		cfg,
		logger,
		getFaucetByChainIDUseCase,
		fetchRemoteAccountBalanceFromAuthorityUseCase,
		faucetUpdateByChainIDUseCase,
	)

	// --- Dashboard ---

	getDasbhoardService := sv_dashboard.NewGetDashboardService(
		cfg,
		logger,
		getFaucetByChainIDUseCase,
		userGetByIDUseCase,
		fetchRemoteAccountBalanceFromAuthorityUseCase,
	)

	// --- Transactions ---

	getUserTransactionsService := svc_transactions.NewGetUserTransactionsService(
		cfg,
		logger,
		userGetByIDUseCase,
	)

	// --- Claim Coins ---

	claimCoinsService := svc_claimcoins.NewClaimCoinsService(
		cfg,
		logger,
		dmutex,
		getFaucetByChainIDUseCase,
		faucetUpdateByChainIDUseCase,
		fetchRemoteAccountBalanceFromAuthorityUseCase,
		getPublicFaucetPrivateKeyService,
		submitMempoolTransactionDTOToBlockchainAuthorityUseCase, // (External package)
		userGetByIDUseCase,
		userUpdateUseCase,
		userGetByWalletAddressUseCase,
	)
	// --- Gateway ---

	gatewayUserRegisterService := svc_gateway.NewGatewayUserRegisterService(
		cfg,
		logger,
		passp,
		mongodbCacheProvider,
		jwtp,
		userGetByEmailUseCase,
		userCreateUseCase,
		userUpdateUseCase,
		sendUserVerificationEmailUseCase,
	)
	gatewayVerifyEmailService := svc_gateway.NewGatewayVerifyEmailService(
		logger,
		userGetByVerificationCodeUseCase,
		userUpdateUseCase,
	)
	gatewayLoginService := svc_gateway.NewGatewayLoginService(
		logger,
		passp,
		mongodbCacheProvider,
		jwtp,
		userGetByEmailUseCase,
		userUpdateUseCase,
	)
	gatewayLogoutService := svc_gateway.NewGatewayLogoutService(
		logger,
		mongodbCacheProvider,
	)
	gatewayRefreshTokenService := svc_gateway.NewGatewayRefreshTokenService(
		logger,
		mongodbCacheProvider,
		jwtp,
		userGetByEmailUseCase,
	)
	gatewayForgotPasswordService := svc_gateway.NewGatewayForgotPasswordService(
		logger,
		passp,
		mongodbCacheProvider,
		jwtp,
		userGetByEmailUseCase,
		userUpdateUseCase,
		sendUserPasswordResetEmailUseCase,
	)
	_ = gatewayForgotPasswordService

	////
	//// Interface
	////

	// --- Gateway ---

	gatewayUserRegisterHTTPHandler := http_gateway.NewGatewayUserRegisterHTTPHandler(
		logger,
		dbClient,
		gatewayUserRegisterService,
	)
	gatewayVerifyEmailHTTPHandler := http_gateway.NewGatewayVerifyEmailHTTPHandler(
		logger,
		dbClient,
		gatewayVerifyEmailService,
	)
	gatewayLoginHTTPHandler := http_gateway.NewGatewayLoginHTTPHandler(
		logger,
		dbClient,
		gatewayLoginService,
	)
	gatewayLogoutHTTPHandler := http_gateway.NewGatewayLogoutHTTPHandler(
		logger,
		dbClient,
		gatewayLogoutService,
	)
	gatewayRefreshTokenHTTPHandler := http_gateway.NewGatewayRefreshTokenHTTPHandler(
		logger,
		dbClient,
		gatewayRefreshTokenService,
	)
	gatewayForgotPasswordHTTPHandler := http_gateway.NewGatewayForgotPasswordHTTPHandler(
		logger,
		dbClient,
		gatewayForgotPasswordService,
	)

	// --- Hello ---

	getHelloHTTPHandler := http_hello.NewGetHelloHTTPHandler(
		cfg,
		logger,
		getHelloService,
	)

	// --- Me ---

	getMeHTTPHandler := http_me.NewGetMeHTTPHandler(
		cfg,
		logger,
		dbClient,
		getMeServiceImpl,
	)

	postMeConnectWalletHTTPHandler := http_me.NewPostMeConnectWalletHTTPHandler(
		cfg,
		logger,
		dbClient,
		meConnectWalletService,
	)

	putUpdateMeHTTPHandler := http_me.NewPutUpdateMeHTTPHandler(
		cfg,
		logger,
		dbClient,
		updateMeService,
	)

	deleteMeHTTPHandler := http_me.NewDeleteMeHTTPHandler(
		cfg,
		logger,
		dbClient,
		deleteMeService,
	)

	// --- Faucet ---

	getFaucetByChainIDHTTPHandler := http_faucet.NewGetFaucetByChainIDHTTPHandler(
		cfg,
		logger,
		dbClient,
		getFaucetService,
	)

	faucetServerSentEventsHTTPHandler := http_faucet.NewFaucetServerSentEventsHTTPHandler(
		logger,
		dbClient,
		getFaucetService,
	)

	// --- Dashboard ---

	dashboardHTTPHandler := http_dashboard.NewDashboardHTTPHandler(
		cfg,
		logger,
		dbClient,
		getDasbhoardService,
	)

	// --- Transactions ---

	getUserTransactionsHTTPHandler := http_transactions.NewGetUserTransactionsHTTPHandler(
		cfg,
		logger,
		dbClient,
		getUserTransactionsService,
	)

	// --- Claim Coins ---

	postClaimCoinsHTTPHandler := http_claimcoins.NewPostClaimCoinsHTTPHandler(
		cfg,
		logger,
		dbClient,
		claimCoinsService,
	)

	// --- HTTP Middleware ---

	httpMiddleware := httpmiddle.NewMiddleware(
		logger,
		blackp,
		ipcbp,
		jwtp,
		userGetBySessionIDUseCase,
		bannedIPAddressListAllValuesUseCase,
	)

	// --- HTTP Server ---

	httpServ := http.NewHTTPServer(
		cfg,
		logger,
		httpMiddleware,
		gatewayUserRegisterHTTPHandler,
		gatewayVerifyEmailHTTPHandler,
		gatewayLoginHTTPHandler,
		gatewayLogoutHTTPHandler,
		gatewayRefreshTokenHTTPHandler,
		gatewayForgotPasswordHTTPHandler,
		getHelloHTTPHandler,
		getMeHTTPHandler,
		postMeConnectWalletHTTPHandler,
		putUpdateMeHTTPHandler,
		deleteMeHTTPHandler,
		getFaucetByChainIDHTTPHandler,
		faucetServerSentEventsHTTPHandler,
		dashboardHTTPHandler,
		postClaimCoinsHTTPHandler,
		getUserTransactionsHTTPHandler,
	)

	// --- Tasks ---

	balanceSyncTask := tsk_faucet.NewUpdateFaucetBalanceByAuthorityTask(
		cfg,
		logger,
		updateFaucetBalanceByAuthorityService,
	)

	taskManager := task.NewTaskManager(
		cfg,
		logger,
		dbClient,
		balanceSyncTask,
	)

	// --- Initialize ---

	// Create our faucet for mainnet blockchain if it doesn't exist.
	if err := createIfFaucetDNEForMainNetBlockchainUseCase.Execute(context.Background()); err != nil {
		log.Fatalf("Failed to check if MainNet faucet doesn't exist: %v", err)
	}

	// --- Return ---

	return &PublicFaucetModule{
		config:               cfg,
		logger:               logger,
		dbClient:             dbClient,
		keystore:             keystore,
		passp:                passp,
		jwtp:                 jwtp,
		blackp:               blackp,
		mongodbCacheProvider: mongodbCacheProvider,
		dmutex:               dmutex,
		ipcbp:                ipcbp,
		httpServer:           httpServ,
		taskManager:          taskManager,
	}

}

func (s *PublicFaucetModule) GetHTTPServerInstance() httpserver.HTTPServer {
	return s.httpServer
}

func (s *PublicFaucetModule) GetTaskManagerInstance() task.TaskManager {
	return s.taskManager
}
