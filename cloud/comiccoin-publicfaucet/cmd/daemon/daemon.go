// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/cmd/daemon/daemon.go
package daemon

import (
	"os"
	"os/signal"
	"syscall"

	"github.com/spf13/cobra"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/logger"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/security/blacklist"
	ipcb "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/security/ipcountryblocker"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/security/jwt"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/security/password"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/storage/database/mongodb"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/storage/database/mongodbcache"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/interface/http"
	httphandler "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/interface/http/handler"
	http_introspection "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/interface/http/introspection"
	http_login "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/interface/http/login"
	httpmiddle "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/interface/http/middleware"
	http_registration "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/interface/http/registration"
	http_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/interface/http/token"
	r_banip "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/repo/bannedipaddress"
	r_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/repo/oauth"
	r_oauthsession "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/repo/oauthsession"
	r_oauthstate "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/repo/oauthstate"
	r_registration "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/repo/registration"
	r_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/repo/token"
	r_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/repo/user"
	svc_introspection "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/service/introspection"
	svc_login "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/service/login"
	svc_registration "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/service/registration"
	svc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/service/token"
	uc_bannedipaddress "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/usecase/bannedipaddress"
	uc_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/usecase/oauth"
	uc_oauthsession "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/usecase/oauthsession"
	uc_oauthstate "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/usecase/oauthstate"
	uc_register "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/usecase/register"
	uc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/usecase/token"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/usecase/user"
)

func DaemonCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "daemon",
		Short: "Run the ComicCoin PublicFaucet",
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
	logger.Debug("publicfaucet configuration ready")
	dbClient := mongodb.NewProvider(cfg, logger)
	blackp := blacklist.NewProvider()
	jwtp := jwt.NewProvider(cfg)
	cache := mongodbcache.NewCache(cfg, logger, dbClient)
	ipcbp := ipcb.NewProvider(cfg, logger)
	passp := password.NewProvider()
	_ = passp

	//
	// Repository
	//

	banIPAddrRepo := r_banip.NewRepository(cfg, logger, dbClient)
	userRepo := r_user.NewRepository(cfg, logger, dbClient)
	tokenRepo := r_token.NewRepository(cfg, logger, dbClient)
	oauthRepo := r_oauth.NewRepository(cfg, logger)
	registrationRepo := r_registration.NewRepository(cfg, logger)
	oauthsessionRepo := r_oauthsession.NewRepository(cfg, logger, dbClient)
	oauthstateRepo := r_oauthstate.NewRepository(cfg, logger, dbClient)

	//
	// Use-case
	//

	// --- Banned IP Addresses ---
	bannedIPAddressListAllValuesUseCase := uc_bannedipaddress.NewBannedIPAddressListAllValuesUseCase(
		cfg,
		logger,
		banIPAddrRepo,
	)

	// --- User ---
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
	userUpdateUseCase := uc_user.NewUserUpdateUseCase(
		cfg,
		logger,
		userRepo,
	)
	_ = userUpdateUseCase     //TODO: Utilize
	_ = userCreateUseCase     //TODO: Utilize
	_ = userGetByEmailUseCase //TODO: Utilize

	// --- Token ---
	tokenUpsertByUserIDUseCase := uc_token.NewTokenUpsertByUserIDUseCase(
		cfg,
		logger,
		tokenRepo,
	)
	tokenGetByUserIDUseCase := uc_token.NewTokenGetByUserIDUseCase(
		cfg,
		logger,
		tokenRepo,
	)
	tokenDeleteExpiredUseCase := uc_token.NewTokenDeleteExpiredUseCase(
		cfg,
		logger,
		tokenRepo,
	)
	_ = tokenDeleteExpiredUseCase  //TODO: Utilize
	_ = tokenUpsertByUserIDUseCase //TODO: Utilize
	_ = tokenGetByUserIDUseCase    //TODO: Utilize

	// --- oAuth 2.0 ---
	getAuthorizationURLUseCase := uc_oauth.NewGetAuthorizationURLUseCase(
		cfg,
		logger,
		oauthRepo,
	)
	exchangeCodeUseCase := uc_oauth.NewExchangeCodeUseCase(
		cfg,
		logger,
		oauthRepo,
	)
	refreshTokenUseCase := uc_oauth.NewRefreshTokenUseCase(
		cfg,
		logger,
		oauthRepo,
	)
	introspectTokenUseCase := uc_oauth.NewIntrospectTokenUseCase(
		cfg,
		logger,
		oauthRepo,
	)

	_ = getAuthorizationURLUseCase //TODO: Utilize
	_ = exchangeCodeUseCase        //TODO: Utilize
	_ = refreshTokenUseCase        //TODO: Utilize
	_ = introspectTokenUseCase     //TODO: Utilize

	// --- Registration ---

	registerUseCase := uc_register.NewRegisterUseCase(
		cfg,
		logger,
		registrationRepo,
	)
	_ = registerUseCase //TODO: Utilize

	// --- oAuth Session ---

	createOAuthSessionUseCase := uc_oauthsession.NewCreateOAuthSessionUseCase(
		cfg,
		logger,
		oauthsessionRepo,
	)
	deleteExpiredOAuthSessionsUseCase := uc_oauthsession.NewDeleteExpiredOAuthSessionsUseCase(
		cfg,
		logger,
		oauthsessionRepo,
	)
	deleteOAuthSessionUseCase := uc_oauthsession.NewDeleteOAuthSessionUseCase(
		cfg,
		logger,
		oauthsessionRepo,
	)
	getOAuthSessionByUserIDUseCase := uc_oauthsession.NewGetOAuthSessionByUserIDUseCase(
		cfg,
		logger,
		oauthsessionRepo,
	)
	updateOAuthSessionUseCase := uc_oauthsession.NewUpdateOAuthSessionUseCase(
		cfg,
		logger,
		oauthsessionRepo,
	)

	_ = createOAuthSessionUseCase         //TODO: Utilize
	_ = deleteExpiredOAuthSessionsUseCase //TODO: Utilize
	_ = deleteOAuthSessionUseCase         //TODO: Utilize
	_ = getOAuthSessionByUserIDUseCase    //TODO: Utilize
	_ = updateOAuthSessionUseCase         //TODO: Utilize

	// --- oAuth state ---

	createOAuthStateUseCase := uc_oauthstate.NewCreateOAuthStateUseCase(
		cfg,
		logger,
		oauthstateRepo,
	)
	getOAuthStateUseCase := uc_oauthstate.NewGetOAuthStateUseCase(
		cfg,
		logger,
		oauthstateRepo,
	)
	deleteOAuthStateUseCase := uc_oauthstate.NewDeleteOAuthStateUseCase(
		cfg,
		logger,
		oauthstateRepo,
	)
	// deleteOAuthStateUseCase := uc_oauthstate.NewDeleteOAuthStateUseCase(
	// 	cfg,
	// 	logger,
	// 	oauthstateRepo,
	// )
	deleteExpiredOAuthStatesUseCase := uc_oauthstate.NewDeleteExpiredOAuthStatesUseCase(
		cfg,
		logger,
		oauthstateRepo,
	)

	_ = createOAuthStateUseCase         //TODO: Utilize
	_ = getOAuthStateUseCase            //TODO: Utilize
	_ = deleteOAuthStateUseCase         //TODO: Utilize
	_ = deleteExpiredOAuthStatesUseCase //TODO: Utilize

	//
	// Service
	//

	// --- Authorization / Authentication / Etc ---

	registration := svc_registration.NewRegistrationService(
		cfg,
		logger,
		registerUseCase,
		exchangeCodeUseCase,
		userCreateUseCase,
		userGetByEmailUseCase,
		tokenUpsertByUserIDUseCase,
	)
	_ = registration

	loginService := svc_login.NewLoginService(
		cfg,
		logger,
		getAuthorizationURLUseCase,
		exchangeCodeUseCase,
		userGetByEmailUseCase,
		tokenUpsertByUserIDUseCase,
	)
	_ = loginService

	refreshTokenService := svc_token.NewRefreshTokenService(
		cfg,
		logger,
		refreshTokenUseCase,
		tokenGetByUserIDUseCase,
		tokenUpsertByUserIDUseCase,
	)
	_ = refreshTokenService
	introspectionService := svc_introspection.NewIntrospectionService(
		cfg,
		logger,
		introspectTokenUseCase,
		tokenGetByUserIDUseCase,
		userGetByIDUseCase,
	)
	_ = introspectionService

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
	registrationHTTPHandler := http_registration.NewPostRegistrationHTTPHandler(
		cfg,
		logger,
		registration,
	)
	postLoginHTTPHandler := http_login.NewPostLoginHTTPHandler(
		cfg,
		logger,
		loginService,
	)
	postTokenRefreshHTTPHandler := http_token.NewPostTokenRefreshHTTPHandler(
		cfg,
		logger,
		refreshTokenService,
	)
	postTokenIntrospectionHTTPHandler := http_introspection.NewPostTokenIntrospectionHTTPHandler(
		cfg,
		logger,
		introspectionService,
	)

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
		registrationHTTPHandler,
		postLoginHTTPHandler,
		postTokenRefreshHTTPHandler,
		postTokenIntrospectionHTTPHandler,
	)

	//
	// Execute
	//

	done := make(chan os.Signal, 1)
	signal.Notify(done, os.Interrupt, syscall.SIGINT, syscall.SIGTERM, syscall.SIGKILL, syscall.SIGUSR1)

	go httpServ.Run()
	defer httpServ.Shutdown()

	logger.Info("ComicCoin PublicFaucet is running.")

	<-done
}
