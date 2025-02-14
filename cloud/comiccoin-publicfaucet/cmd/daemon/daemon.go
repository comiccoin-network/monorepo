// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/cmd/daemon/daemon.go
package daemon

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/spf13/cobra"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/logger"
	common_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient"
	common_oauth_config "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/security/blacklist"
	ipcb "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/security/ipcountryblocker"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/security/jwt"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/security/password"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/storage/database/mongodb"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/storage/database/mongodbcache"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/interface/http"
	http_faucet "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/interface/http/faucet"
	http_hello "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/interface/http/hello"
	http_me "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/interface/http/me"
	httpmiddle "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/interface/http/middleware"
	http_system "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/interface/http/system"
	r_banip "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/repo/bannedipaddress"
	r_faucet "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/repo/faucet"
	r_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/repo/user"
	svc_faucet "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/service/faucet"
	svc_hello "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/service/hello"
	svc_me "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/service/me"
	uc_bannedipaddress "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/usecase/bannedipaddress"
	uc_faucet "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/usecase/faucet"
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

	////
	//// Common
	///

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

	oauthClientConfig := &common_oauth_config.Configuration{
		OAuth: common_oauth_config.OAuthConfig{
			ServerURL:                        cfg.OAuth.ServerURL,
			ClientID:                         cfg.OAuth.ClientID,
			ClientSecret:                     cfg.OAuth.ClientSecret,
			ClientRedirectURI:                cfg.OAuth.ClientRedirectURI,
			ClientRegisterSuccessURI:         cfg.OAuth.ClientRegisterSuccessURI,
			ClientRegisterCancelURI:          cfg.OAuth.ClientRegisterCancelURI,
			ClientAuthorizeOrLoginSuccessURI: cfg.OAuth.ClientAuthorizeOrLoginSuccessURI,
			ClientAuthorizeOrLoginCancelURI:  cfg.OAuth.ClientAuthorizeOrLoginCancelURI,
		},
		DB: common_oauth_config.DBConfig{
			URI:  cfg.DB.URI,
			Name: cfg.DB.Name,
		},
	}
	oauthClientManager, err := common_oauth.NewManager(context.Background(), oauthClientConfig, logger, cache, dbClient)
	if err != nil {
		log.Fatalf("Failed to load up our oAuth 2.0 Client manager")
	}

	////
	//// Repository
	////

	banIPAddrRepo := r_banip.NewRepository(cfg, logger, dbClient)
	userRepo := r_user.NewRepository(cfg, logger, dbClient)
	faucetRepo := r_faucet.NewRepository(cfg, logger, dbClient)

	////
	//// Use-case
	////

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
	userGetByFederatedIdentityIDUseCase := uc_user.NewUserGetByFederatedIdentityIDUseCase(
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
	_ = userGetBySessionIDUseCase
	_ = userGetByEmailUseCase
	_ = userGetByEmailUseCase
	_ = userGetByIDUseCase
	_ = userGetByFederatedIdentityIDUseCase
	_ = userCreateUseCase
	_ = userUpdateUseCase

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
	_ = getFaucetByChainIDUseCase
	_ = faucetUpdateByChainIDUseCase
	_ = checkIfFaucetExistsByChainIDUseCase

	////
	//// Service
	////

	// --- Hello ---

	getHelloService := svc_hello.NewHelloService(
		cfg,
		logger,
		oauthClientManager,
	)

	// --- Me ---

	getMeAfterRemoteSyncServiceImpl := svc_me.NewGetMeAfterRemoteSyncService(
		cfg,
		logger,
		oauthClientManager,
		userGetByFederatedIdentityIDUseCase,
		userCreateUseCase,
		userUpdateUseCase,
	)

	meConnectWalletService := svc_me.NewMeConnectWalletService(
		cfg,
		logger,
		oauthClientManager,
		userGetByFederatedIdentityIDUseCase,
		userUpdateUseCase,
	)

	// --- Faucet ---

	getFaucetService := svc_faucet.NewGetFaucetService(
		cfg,
		logger,
		getFaucetByChainIDUseCase,
	)

	////
	//// Interface
	////

	// --- System ---

	getVersionHTTPHandler := http_system.NewGetVersionHTTPHandler(
		logger,
	)
	getHealthCheckHTTPHandler := http_system.NewGetHealthCheckHTTPHandler(
		logger,
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
		getMeAfterRemoteSyncServiceImpl,
	)

	postMeConnectWalletHTTPHandler := http_me.NewPostMeConnectWalletHTTPHandler(
		cfg,
		logger,
		dbClient,
		meConnectWalletService,
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
		getFaucetService,
	)

	// --- HTTP Middleware ---

	httpMiddleware := httpmiddle.NewMiddleware(
		logger,
		blackp,
		ipcbp,
		jwtp,
		bannedIPAddressListAllValuesUseCase,
		oauthClientManager,
	)

	// --- HTTP Server ---

	httpServ := http.NewHTTPServer(
		cfg,
		logger,
		oauthClientManager,
		httpMiddleware,
		getVersionHTTPHandler,
		getHealthCheckHTTPHandler,
		getHelloHTTPHandler,
		getMeHTTPHandler,
		postMeConnectWalletHTTPHandler,
		getFaucetByChainIDHTTPHandler,
		faucetServerSentEventsHTTPHandler,
	)

	////
	//// Execute
	////

	// Integrate with the OS so we can receive signals.
	done := make(chan os.Signal, 1)
	signal.Notify(done, os.Interrupt, syscall.SIGINT, syscall.SIGTERM, syscall.SIGKILL, syscall.SIGUSR1)

	// Create our faucet for mainnet blockchain if it doesn't exist.
	if err := createIfFaucetDNEForMainNetBlockchainUseCase.Execute(context.Background()); err != nil {
		log.Fatalf("Failed to check if MainNet faucet doesn't exist: %v", err)
	}

	// --- Pre-Execution ---

	// --- Execute Background ---

	go httpServ.Run()
	defer httpServ.Shutdown()

	// --- Execute Foreground ---

	logger.Info("ComicCoin PublicFaucet is running.")

	<-done
}
