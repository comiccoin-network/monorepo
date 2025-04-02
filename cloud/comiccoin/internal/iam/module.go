package iam

import (
	"log/slog"

	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/blockchain/hdkeystore"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/distributedmutex"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/emailer/mailgun"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/blacklist"
	ipcb "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/ipcountryblocker"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/jwt"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/password"
	mongodb_cache "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/storage/database/mongodbcache"
	redis_cache "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/storage/memory/redis"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/interface/http"
	httpserver "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/interface/http"
	http_dashboard "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/interface/http/dashboard"
	http_gateway "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/interface/http/gateway"
	http_hello "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/interface/http/hello"
	http_me "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/interface/http/me"
	httpmiddle "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/interface/http/middleware"
	http_publicwallet "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/interface/http/publicwallet"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/interface/task"
	r_banip "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/repo/bannedipaddress"
	r_publicwallet "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/repo/publicwallet"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/repo/templatedemailer"
	r_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/repo/user"
	sv_dashboard "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/service/dashboard"
	svc_gateway "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/service/gateway"
	svc_hello "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/service/hello"
	svc_me "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/service/me"
	svc_publicwallet "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/service/publicwallet"
	uc_bannedipaddress "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/usecase/bannedipaddress"
	uc_emailer "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/usecase/emailer"
	uc_publicwallet "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/usecase/publicwallet"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/usecase/user"
)

type IAMModule struct {
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
) *IAMModule {

	////
	//// Specific
	////

	mongodbCacheConfigurationProvider := mongodb_cache.NewCacheConfigurationProvider(cfg.DB.IAMName)
	mongodbCacheProvider := mongodb_cache.NewCache(mongodbCacheConfigurationProvider, logger, dbClient)

	mailgunConfigurationProvider := mailgun.NewMailgunConfigurationProvider(
		cfg.IAMEmailer.SenderEmail,
		cfg.IAMEmailer.Domain,
		cfg.IAMEmailer.APIBase,
		cfg.IAMEmailer.MaintenanceEmail,
		cfg.IAMEmailer.FrontendDomain,
		cfg.IAMEmailer.BackendDomain,
		cfg.IAMEmailer.APIKey,
	)
	emailer := mailgun.NewEmailer(mailgunConfigurationProvider, logger)
	templatedEmailer := templatedemailer.NewTemplatedEmailer(logger, emailer)

	////
	//// Repository
	////

	banIPAddrRepo := r_banip.NewRepository(cfg, logger, dbClient)
	userRepo := r_user.NewRepository(cfg, logger, dbClient)
	publicWalletRepo := r_publicwallet.NewRepository(cfg, logger, dbClient)

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

	// --- Public Wallets ---
	publicWalletCreateUseCase := uc_publicwallet.NewPublicWalletCreateUseCase(
		cfg,
		logger,
		publicWalletRepo,
	)
	publicWalletGetByIDUseCase := uc_publicwallet.NewPublicWalletGetByIDUseCase(
		cfg,
		logger,
		publicWalletRepo,
	)
	publicWalletGetByAddressUseCase := uc_publicwallet.NewPublicWalletGetByAddressUseCase(
		cfg,
		logger,
		publicWalletRepo,
	)
	publicWalletUpdateByIDUseCase := uc_publicwallet.NewPublicWalletUpdateByIDUseCase(
		cfg,
		logger,
		publicWalletRepo,
	)
	publicWalletUpdateByAddressUseCase := uc_publicwallet.NewPublicWalletUpdateByAddressUseCase(
		cfg,
		logger,
		publicWalletRepo,
	)
	publicWalletDeleteByIDUseCase := uc_publicwallet.NewPublicWalletDeleteByIDUseCase(
		cfg,
		logger,
		publicWalletRepo,
	)
	publicWalletDeleteByAddressUseCase := uc_publicwallet.NewPublicWalletDeleteByAddressUseCase(
		cfg,
		logger,
		publicWalletRepo,
	)
	publicWalletListByFilterUseCase := uc_publicwallet.NewPublicWalletListByFilterUseCase(
		cfg,
		logger,
		publicWalletRepo,
	)
	publicWalletCountByFilterUseCase := uc_publicwallet.NewPublicWalletCountByFilterUseCase(
		cfg,
		logger,
		publicWalletRepo,
	)
	publicWalletListAllAddressesUseCase := uc_publicwallet.NewPublicWalletListAllAddressesUseCase(
		cfg,
		logger,
		publicWalletRepo,
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
	verifyProfileService := svc_me.NewVerifyProfileService(
		cfg,
		logger,
		userGetByIDUseCase,
		userUpdateUseCase,
	)

	// --- Dashboard ---

	getDasbhoardService := sv_dashboard.NewGetDashboardService(
		cfg,
		logger,
		userGetByIDUseCase,
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
	gatewayResetPasswordService := svc_gateway.NewGatewayResetPasswordService(
		logger,
		passp,
		mongodbCacheProvider,
		jwtp,
		userGetByEmailUseCase,
		userUpdateUseCase,
	)

	// --- Public Wallet ---
	createPublicWalletService := svc_publicwallet.NewCreatePublicWalletService(
		cfg,
		logger,
		publicWalletCreateUseCase,
	)
	getPublicWalletByIDService := svc_publicwallet.NewGetPublicWalletByIDService(
		cfg,
		logger,
		publicWalletGetByIDUseCase,
	)
	getPublicWalletByAddressService := svc_publicwallet.NewGetPublicWalletByAddressService(
		cfg,
		logger,
		publicWalletGetByAddressUseCase,
	)
	updatePublicWalletByIDService := svc_publicwallet.NewUpdatePublicWalletByIDService(
		cfg,
		logger,
		publicWalletUpdateByIDUseCase,
	)
	updatePublicWalletByAddressService := svc_publicwallet.NewUpdatePublicWalletByAddressService(
		cfg,
		logger,
		publicWalletUpdateByAddressUseCase,
	)
	deletePublicWalletByIDService := svc_publicwallet.NewDeletePublicWalletByIDService(
		cfg,
		logger,
		publicWalletDeleteByIDUseCase,
	)
	deletePublicWalletByAddressService := svc_publicwallet.NewDeletePublicWalletByAddressService(
		cfg,
		logger,
		publicWalletDeleteByAddressUseCase,
	)
	listPublicWalletsByFilterService := svc_publicwallet.NewListPublicWalletsByFilterService(
		cfg,
		logger,
		publicWalletListByFilterUseCase,
	)
	countPublicWalletsByFilterService := svc_publicwallet.NewCountPublicWalletsByFilterService(
		cfg,
		logger,
		publicWalletCountByFilterUseCase,
	)
	listAllPublicWalletAddressesService := svc_publicwallet.NewListAllPublicWalletAddressesService(
		cfg,
		logger,
		publicWalletListAllAddressesUseCase,
	)

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
	gatewayResetPasswordHTTPHandler := http_gateway.NewGatewayResetPasswordHTTPHandler(
		logger,
		dbClient,
		gatewayResetPasswordService,
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

	// --- Public Wallet ---

	createPublicWalletHTTPHandler := http_publicwallet.NewCreatePublicWalletHTTPHandler(
		cfg,
		logger,
		dbClient,
		createPublicWalletService,
	)
	getPublicWalletByIDHTTPHandler := http_publicwallet.NewGetPublicWalletByIDHTTPHandler(
		cfg,
		logger,
		dbClient,
		getPublicWalletByIDService,
	)
	getPublicWalletByAddressHTTPHandler := http_publicwallet.NewGetPublicWalletByAddressHTTPHandler(
		cfg,
		logger,
		dbClient,
		getPublicWalletByAddressService,
	)
	updatePublicWalletByIDHTTPHandler := http_publicwallet.NewUpdatePublicWalletByIDHTTPHandler(
		cfg,
		logger,
		dbClient,
		updatePublicWalletByIDService,
	)
	updatePublicWalletByAddressHTTPHandler := http_publicwallet.NewUpdatePublicWalletByAddressHTTPHandler(
		cfg,
		logger,
		dbClient,
		updatePublicWalletByAddressService,
	)
	deletePublicWalletByIDHTTPHandler := http_publicwallet.NewDeletePublicWalletByIDHTTPHandler(
		cfg,
		logger,
		dbClient,
		deletePublicWalletByIDService,
	)
	deletePublicWalletByAddressHTTPHandler := http_publicwallet.NewDeletePublicWalletByAddressHTTPHandler(
		cfg,
		logger,
		dbClient,
		deletePublicWalletByAddressService,
	)
	listPublicWalletsByFilterHTTPHandler := http_publicwallet.NewListPublicWalletsByFilterHTTPHandler(
		cfg,
		logger,
		dbClient,
		listPublicWalletsByFilterService,
	)
	countPublicWalletsByFilterHTTPHandler := http_publicwallet.NewCountPublicWalletsByFilterHTTPHandler(
		cfg,
		logger,
		dbClient,
		countPublicWalletsByFilterService,
	)
	listAllPublicWalletAddressesHTTPHandler := http_publicwallet.NewListAllPublicWalletAddressesHTTPHandler(
		cfg,
		logger,
		dbClient,
		listAllPublicWalletAddressesService,
	)

	// --- Dashboard ---

	dashboardHTTPHandler := http_dashboard.NewDashboardHTTPHandler(
		cfg,
		logger,
		dbClient,
		getDasbhoardService,
	)
	postVerifyProfileHTTPHandler := http_me.NewPostVerifyProfileHTTPHandler(
		cfg,
		logger,
		dbClient,
		verifyProfileService,
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
		gatewayResetPasswordHTTPHandler,
		getHelloHTTPHandler,
		getMeHTTPHandler,
		postMeConnectWalletHTTPHandler,
		putUpdateMeHTTPHandler,
		deleteMeHTTPHandler,
		postVerifyProfileHTTPHandler,
		createPublicWalletHTTPHandler,
		getPublicWalletByIDHTTPHandler,
		getPublicWalletByAddressHTTPHandler,
		updatePublicWalletByIDHTTPHandler,
		updatePublicWalletByAddressHTTPHandler,
		deletePublicWalletByIDHTTPHandler,
		deletePublicWalletByAddressHTTPHandler,
		listPublicWalletsByFilterHTTPHandler,
		countPublicWalletsByFilterHTTPHandler,
		listAllPublicWalletAddressesHTTPHandler,
		dashboardHTTPHandler,
	)

	// --- Tasks ---

	taskManager := task.NewTaskManager(
		cfg,
		logger,
		dbClient,
	)

	// --- Initialize ---
	// Do nothing here...

	// --- Return ---

	return &IAMModule{
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

func (s *IAMModule) GetHTTPServerInstance() httpserver.HTTPServer {
	return s.httpServer
}

func (s *IAMModule) GetTaskManagerInstance() task.TaskManager {
	return s.taskManager
}
