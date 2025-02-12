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
	http_hello "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/interface/http/hello"
	httpmiddle "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/interface/http/middleware"
	http_system "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/interface/http/system"
	r_banip "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/repo/bannedipaddress"
	svc_hello "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/service/hello"
	uc_bannedipaddress "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/usecase/bannedipaddress"
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

	//
	// Repository
	//

	banIPAddrRepo := r_banip.NewRepository(cfg, logger, dbClient)

	//
	// Use-case
	//

	// --- Banned IP Addresses ---
	bannedIPAddressListAllValuesUseCase := uc_bannedipaddress.NewBannedIPAddressListAllValuesUseCase(
		cfg,
		logger,
		banIPAddrRepo,
	)

	// --- Resources ---

	getHelloService := svc_hello.NewHelloService(
		cfg,
		logger,
		oauthClientManager,
	)

	//
	// Interface
	//

	// --- System ---
	getVersionHTTPHandler := http_system.NewGetVersionHTTPHandler(
		logger,
	)
	getHealthCheckHTTPHandler := http_system.NewGetHealthCheckHTTPHandler(
		logger,
	)

	//
	getHelloHTTPHandler := http_hello.NewGetHelloHTTPHandler(
		cfg,
		logger,
		getHelloService,
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
