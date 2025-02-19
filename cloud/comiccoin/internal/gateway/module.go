package gateway

import (
	"log/slog"

	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/blockchain/hdkeystore"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/distributedmutex"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/blacklist"
	ipcb "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/ipcountryblocker"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/jwt"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/password"
	mongodb_cache "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/storage/database/mongodbcache"
	redis_cache "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/storage/memory/redis"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/interface/http"
	httpserver "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/interface/http"
	http_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/interface/http/federatedidentity"
	http_identity "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/interface/http/identity"
	httpmiddle "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/interface/http/middleware"
	http_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/interface/http/oauth"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/interface/task"
	r_application "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/repo/application"
	r_authorization "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/repo/authorization"
	r_banip "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/repo/bannedipaddress"
	r_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/repo/federatedidentity"
	r_ratelimit "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/repo/ratelimiter"
	r_token "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/repo/token"
	svc_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/service/federatedidentity"
	svc_identity "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/service/identity"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/service/oauth"
	uc_app "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/usecase/application"
	uc_auth "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/usecase/authorization"
	uc_bannedipaddress "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/usecase/bannedipaddress"
	uc_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/usecase/federatedidentity"
	uc_ratelimit "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/usecase/ratelimiter"
	uc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/usecase/token"
)

type GatewayModule struct {
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
) *GatewayModule {

	//
	// Repository
	//

	mongodbCacheConfigurationProvider := mongodb_cache.NewCacheConfigurationProvider(cfg.DB.GatewayName)
	mongodbCacheProvider := mongodb_cache.NewCache(mongodbCacheConfigurationProvider, logger, dbClient)

	banIPAddrRepo := r_banip.NewRepository(cfg, logger, dbClient)
	federatedidentityRepo := r_federatedidentity.NewRepository(cfg, logger, dbClient)
	applicationRepo := r_application.NewRepository(cfg, logger, dbClient)
	authorizationRepo := r_authorization.NewRepository(cfg, logger, dbClient)
	tokenRepo := r_token.NewRepository(cfg, logger, dbClient)
	rateLimiterRepo := r_ratelimit.NewRateLimiter(cfg, logger, mongodbCacheProvider)

	//
	// Use-case
	//

	// Banned IP Addresses
	bannedIPAddressListAllValuesUseCase := uc_bannedipaddress.NewBannedIPAddressListAllValuesUseCase(
		cfg,
		logger,
		banIPAddrRepo,
	)

	// FederatedIdentity Use Cases
	federatedidentityGetBySessionIDUseCase := uc_federatedidentity.NewFederatedIdentityGetBySessionIDUseCase(
		cfg,
		logger,
		mongodbCacheProvider,
	)
	federatedidentityGetByEmailUseCase := uc_federatedidentity.NewFederatedIdentityGetByEmailUseCase(
		cfg,
		logger,
		federatedidentityRepo,
	)
	federatedidentityGetByIDUseCase := uc_federatedidentity.NewFederatedIdentityGetByIDUseCase(
		cfg,
		logger,
		federatedidentityRepo,
	)
	federatedidentityCreateUseCase := uc_federatedidentity.NewFederatedIdentityCreateUseCase(
		cfg,
		logger,
		federatedidentityRepo,
	)
	_ = federatedidentityCreateUseCase //TODO: Utilize
	federatedidentityUpdateUseCase := uc_federatedidentity.NewFederatedIdentityUpdateUseCase(
		cfg,
		logger,
		federatedidentityRepo,
	)
	_ = federatedidentityUpdateUseCase //TODO: Utilize

	// Application Use Cases
	appValidateCredentialsUseCase := uc_app.NewApplicationValidateCredentialsUseCase(
		cfg,
		logger,
		applicationRepo,
	)
	appFindByAppIDUseCase := uc_app.NewApplicationFindByAppIDUseCase(
		cfg,
		logger,
		applicationRepo,
	)

	// Authorization Use Cases
	authFindByCodeUseCase := uc_auth.NewAuthorizationFindByCodeUseCase(
		cfg,
		logger,
		authorizationRepo,
	)
	authStoreCodeUseCase := uc_auth.NewAuthorizationStoreCodeUseCase(
		cfg,
		logger,
		authorizationRepo,
	)
	_ = authStoreCodeUseCase
	authMarkCodeAsUsedUseCase := uc_auth.NewAuthorizationMarkCodeAsUsedUseCase(
		cfg,
		logger,
		authorizationRepo,
	)
	authDeleteExpiredCodesUseCase := uc_auth.NewAuthorizationDeleteExpiredCodesUseCase(
		cfg,
		logger,
		authorizationRepo,
	)
	authUpdateCodeUseCase := uc_auth.NewAuthorizationUpdateCodeUseCase(
		cfg,
		logger,
		authorizationRepo,
	)

	// Token Use Cases
	tokenFindByIDUseCase := uc_token.NewTokenFindByIDUseCase(
		cfg,
		logger,
		tokenRepo,
	)
	tokenStoreUseCase := uc_token.NewTokenStoreUseCase(
		cfg,
		logger,
		tokenRepo,
	)
	tokenRevokeUseCase := uc_token.NewTokenRevokeUseCase(
		cfg,
		logger,
		tokenRepo,
	)
	_ = tokenRevokeUseCase //TODO: Utilize
	tokenRevokeAllFederatedIdentityTokensUseCase := uc_token.NewTokenRevokeAllFederatedIdentityTokensUseCase(
		cfg,
		logger,
		tokenRepo,
	)
	_ = tokenRevokeAllFederatedIdentityTokensUseCase //TODO: Utilize

	// --- Rate Limiter --- //

	rateLimiterIsAllowedUseCase := uc_ratelimit.NewIsAllowedUseCase(
		cfg,
		logger,
		rateLimiterRepo,
	)

	rateLimiterRecordFailureUseCase := uc_ratelimit.NewRecordFailureUseCase(
		cfg,
		logger,
		rateLimiterRepo,
	)

	rateLimiterResetFailuresUseCase := uc_ratelimit.NewResetFailuresUseCase(
		cfg,
		logger,
		rateLimiterRepo,
	)

	//
	// Service
	//

	// OAuth Services
	authorizeService := oauth.NewAuthorizeService(
		cfg,
		logger,
		appValidateCredentialsUseCase,
		appFindByAppIDUseCase,
		authFindByCodeUseCase,
		authStoreCodeUseCase,
		authUpdateCodeUseCase,
	)

	loginService := oauth.NewLoginService(
		cfg,
		logger,
		passp,
		federatedidentityGetByEmailUseCase,
		authFindByCodeUseCase,
		authUpdateCodeUseCase,
		authDeleteExpiredCodesUseCase,
	)

	tokenService := oauth.NewTokenService(
		cfg,
		logger,
		appValidateCredentialsUseCase,
		authFindByCodeUseCase,
		authMarkCodeAsUsedUseCase,
		tokenStoreUseCase,
	)
	_ = tokenService //TODO: Utilize

	refreshTokenService := oauth.NewRefreshTokenService(
		cfg,
		logger,
		appValidateCredentialsUseCase,
		tokenFindByIDUseCase,
		tokenStoreUseCase,
		tokenRevokeUseCase,
	)

	introspectionService := oauth.NewIntrospectionService(
		cfg,
		logger,
		appValidateCredentialsUseCase,
		tokenFindByIDUseCase,
		federatedidentityGetByIDUseCase,
	)

	// --- FederatedIdentity ---

	registerService := svc_federatedidentity.NewRegisterService(
		cfg,
		logger,
		passp,
		federatedidentityGetByEmailUseCase,
		federatedidentityCreateUseCase,
		appFindByAppIDUseCase,
		authFindByCodeUseCase,
		authorizeService,
	)

	updateFederatedIdentityService := svc_federatedidentity.NewUpdateFederatedIdentityService(
		cfg,
		logger,
		passp,
		federatedidentityGetByIDUseCase,
		federatedidentityUpdateUseCase,
		rateLimiterIsAllowedUseCase,
		rateLimiterRecordFailureUseCase,
		rateLimiterResetFailuresUseCase,
	)

	// Identity
	getIdentityService := svc_identity.NewGetIdentityService(
		cfg,
		logger,
		mongodbCacheProvider,
		tokenFindByIDUseCase,
		federatedidentityGetByIDUseCase,
		rateLimiterIsAllowedUseCase,
		rateLimiterRecordFailureUseCase,
		rateLimiterResetFailuresUseCase,
	)

	//
	// Interface
	//

	// --- Tasks ---

	taskManager := task.NewTaskManager(
		cfg,
		logger,
	)

	// --- HTTP Handlers ---

	authorizeHttpHandler := http_oauth.NewAuthorizeHandler(logger, authorizeService)
	loginHttpHandler := http_oauth.NewLoginHandler(logger, loginService)
	tokenHttpHandler := http_oauth.NewTokenHandler(logger, tokenService)
	refreshTokenHttpHandler := http_oauth.NewRefreshTokenHandler(logger, refreshTokenService)
	introspectionHttpHandler := http_oauth.NewIntrospectionHandler(logger, introspectionService)
	registerHandler := http_federatedidentity.NewRegisterHandler(logger, registerService)
	getIdentityHandler := http_identity.NewGetIdentityHandler(logger, getIdentityService)
	updateFederatedIdentityHandler := http_federatedidentity.NewUpdateFederatedIdentityHandler(logger, updateFederatedIdentityService)

	// --- HTTP Middleware ---

	httpMiddleware := httpmiddle.NewMiddleware(
		logger,
		blackp,
		ipcbp,
		jwtp,
		federatedidentityGetBySessionIDUseCase,
		bannedIPAddressListAllValuesUseCase,
	)

	// --- HTTP Server ---

	httpServ := http.NewHTTPServer(
		cfg,
		logger,
		httpMiddleware,
		authorizeHttpHandler,
		loginHttpHandler,
		tokenHttpHandler,
		introspectionHttpHandler,
		refreshTokenHttpHandler,
		registerHandler,
		getIdentityHandler,
		updateFederatedIdentityHandler,
	)

	return &GatewayModule{
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

func (s *GatewayModule) GetHTTPServerInstance() httpserver.HTTPServer {
	return s.httpServer
}

func (s *GatewayModule) GetTaskManagerInstance() task.TaskManager {
	return s.taskManager
}
