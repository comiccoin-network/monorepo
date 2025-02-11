// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/cmd/daemon/daemon.go
package daemon

import (
	"os"
	"os/signal"
	"syscall"

	"github.com/spf13/cobra"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/logger"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/security/blacklist"
	ipcb "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/security/ipcountryblocker"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/security/jwt"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/security/password"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/storage/database/mongodb"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/storage/database/mongodbcache"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/interface/http"
	httphandler "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/interface/http/handler"
	http_identity "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/interface/http/identity"
	httpmiddle "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/interface/http/middleware"
	http_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/interface/http/oauth"
	http_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/interface/http/user"
	r_application "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/repo/application"
	r_authorization "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/repo/authorization"
	r_banip "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/repo/bannedipaddress"
	r_ratelimit "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/repo/ratelimiter"
	r_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/repo/token"
	r_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/repo/user"
	svc_identity "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/service/identity"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/service/oauth"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/service/user"
	uc_app "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/usecase/application"
	uc_auth "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/usecase/authorization"
	uc_bannedipaddress "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/usecase/bannedipaddress"
	uc_ratelimit "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/usecase/ratelimiter"
	uc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/usecase/token"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/usecase/user"
)

func DaemonCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "daemon",
		Short: "Run the ComicCoin Gateway",
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
	logger.Debug("gateway configuration ready")
	dbClient := mongodb.NewProvider(cfg, logger)
	blackp := blacklist.NewProvider()
	jwtp := jwt.NewProvider(cfg)
	cache := mongodbcache.NewCache(cfg, logger, dbClient)
	ipcbp := ipcb.NewProvider(cfg, logger)
	passp := password.NewProvider()

	//
	// Repository
	//

	banIPAddrRepo := r_banip.NewRepository(cfg, logger, dbClient)
	userRepo := r_user.NewRepository(cfg, logger, dbClient)
	applicationRepo := r_application.NewRepository(cfg, logger, dbClient)
	authorizationRepo := r_authorization.NewRepository(cfg, logger, dbClient)
	tokenRepo := r_token.NewRepository(cfg, logger, dbClient)
	rateLimiterRepo := r_ratelimit.NewRateLimiter(cfg, logger, cache)

	//
	// Use-case
	//

	// Banned IP Addresses
	bannedIPAddressListAllValuesUseCase := uc_bannedipaddress.NewBannedIPAddressListAllValuesUseCase(
		cfg,
		logger,
		banIPAddrRepo,
	)

	// User Use Cases
	userGetBySessionIDUseCase := uc_user.NewUserGetBySessionIDUseCase(
		cfg,
		logger,
		cache,
	)
	userGetByEmailUseCase := uc_user.NewUserGetByEmailUseCase(
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
	_ = userCreateUseCase //TODO: Utilize
	userUpdateUseCase := uc_user.NewUserUpdateUseCase(
		cfg,
		logger,
		userRepo,
	)
	_ = userUpdateUseCase //TODO: Utilize

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
	tokenRevokeAllUserTokensUseCase := uc_token.NewTokenRevokeAllUserTokensUseCase(
		cfg,
		logger,
		tokenRepo,
	)
	_ = tokenRevokeAllUserTokensUseCase //TODO: Utilize

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
		userGetByEmailUseCase,
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
		userGetByIDUseCase,
	)

	// User
	registerService := user.NewRegisterService(
		cfg,
		logger,
		passp,
		userCreateUseCase,
		appFindByAppIDUseCase,
		authorizeService,
	)

	// Identity
	getIdentityService := svc_identity.NewGetIdentityService(
		cfg,
		logger,
		cache,
		tokenFindByIDUseCase,
		userGetByIDUseCase,
		rateLimiterIsAllowedUseCase,
		rateLimiterRecordFailureUseCase,
		rateLimiterResetFailuresUseCase,
	)

	//
	// Interface
	//

	// HTTP Handlers
	getVersionHTTPHandler := httphandler.NewGetVersionHTTPHandler(
		logger,
	)
	getHealthCheckHTTPHandler := httphandler.NewGetHealthCheckHTTPHandler(
		logger,
	)
	authorizeHttpHandler := http_oauth.NewAuthorizeHandler(logger, authorizeService)
	loginHttpHandler := http_oauth.NewLoginHandler(logger, loginService)
	tokenHttpHandler := http_oauth.NewTokenHandler(logger, tokenService)
	refreshTokenHttpHandler := http_oauth.NewRefreshTokenHandler(logger, refreshTokenService)
	introspectionHttpHandler := http_oauth.NewIntrospectionHandler(logger, introspectionService)
	registerHandler := http_user.NewRegisterHandler(logger, registerService)
	getIdentityHandler := http_identity.NewGetIdentityHandler(logger, getIdentityService)

	// HTTP Middleware
	httpMiddleware := httpmiddle.NewMiddleware(
		logger,
		blackp,
		ipcbp,
		jwtp,
		userGetBySessionIDUseCase,
		bannedIPAddressListAllValuesUseCase,
	)

	// HTTP Server
	httpServ := http.NewHTTPServer(
		cfg,
		logger,
		httpMiddleware,
		getVersionHTTPHandler,
		getHealthCheckHTTPHandler,
		authorizeHttpHandler,
		loginHttpHandler,
		tokenHttpHandler,
		introspectionHttpHandler,
		refreshTokenHttpHandler,
		registerHandler,
		getIdentityHandler,
	)

	//
	// Execute
	//

	done := make(chan os.Signal, 1)
	signal.Notify(done, os.Interrupt, syscall.SIGINT, syscall.SIGTERM, syscall.SIGKILL, syscall.SIGUSR1)

	go httpServ.Run()
	defer httpServ.Shutdown()

	logger.Info("ComicCoin Gateway is running.")

	<-done
}
