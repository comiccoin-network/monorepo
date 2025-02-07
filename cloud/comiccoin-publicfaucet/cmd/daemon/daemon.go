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
	httpmiddle "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/interface/http/middleware"
	r_banip "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/repo/bannedipaddress"
	r_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/repo/user"
	uc_bannedipaddress "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/usecase/bannedipaddress"
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
	_ = userGetByEmailUseCase
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

	//
	// Service
	//

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
