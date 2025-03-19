package daemon

import (
	// "context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/spf13/cobra"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/blockchain/hdkeystore"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/distributedmutex"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/logger"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/blacklist"
	ipcb "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/ipcountryblocker"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/jwt"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/password"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/storage/database/mongodb"
	redis_cache "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/storage/memory/redis"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/unifiedhttp"
	unifiedmiddleware "github.com/comiccoin-network/monorepo/cloud/comiccoin/unifiedhttp/middleware"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/nameservice"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet"
)

func DaemonCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "daemon",
		Short: "Run the ComicCoin full node instance",
		Run: func(cmd *cobra.Command, args []string) {
			log.Println("Running daemon......")
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

	// Load up our operating system interaction handlers, more specifically
	// signals. The OS sends our application various signals based on the
	// OS's state, we want to listen into the termination signals.
	done := make(chan os.Signal, 1)
	signal.Notify(done, os.Interrupt, syscall.SIGINT, syscall.SIGTERM, syscall.SIGKILL, syscall.SIGUSR1)

	//
	// STEP 2
	// Load up our infrastructure and other dependencies
	//

	// Common
	logger := logger.NewProvider()
	cfg := config.NewProvider()
	dbClient := mongodb.NewProvider(cfg, logger)
	keystore := hdkeystore.NewAdapter()
	passp := password.NewProvider()
	jwtp := jwt.NewProvider(cfg)
	blackp := blacklist.NewProvider()
	redisCacheProvider := redis_cache.NewCache(cfg, logger)
	dmutex := distributedmutex.NewAdapter(logger, redisCacheProvider.GetRedisClient())
	ipcbp := ipcb.NewProvider(cfg, logger)

	//
	// STEP 3
	// Load up our modules.
	//

	// --- Authority ---

	authorityModule := authority.NewModule(
		cfg,
		logger,
		dbClient,
		keystore,
		passp,
		jwtp,
		blackp,
		redisCacheProvider,
		dmutex,
		ipcbp,
	)

	authorityHTTPServer := authorityModule.GetHTTPServerInstance()
	authorityTaskManager := authorityModule.GetTaskManagerInstance()

	// --- Public Faucet ---

	publicfaucetModule := publicfaucet.NewModule(
		cfg,
		logger,
		dbClient,
		keystore,
		passp,
		jwtp,
		blackp,
		redisCacheProvider,
		dmutex,
		ipcbp,
	)

	publicfaucetHTTPServer := publicfaucetModule.GetHTTPServerInstance()
	publicfaucetTaskManager := publicfaucetModule.GetTaskManagerInstance()

	// --- Name Service ---

	nameserviceModule := nameservice.NewModule(
		cfg,
		logger,
		dbClient,
		keystore,
		passp,
		jwtp,
		blackp,
		redisCacheProvider,
		dmutex,
		ipcbp,
	)

	nameserviceHTTPServer := nameserviceModule.GetHTTPServerInstance()
	nameserviceTaskManager := nameserviceModule.GetTaskManagerInstance()

	//
	// STEP 4:
	// Initialize our unified http server and task manager
	//

	httpMiddleware := unifiedmiddleware.NewMiddleware(
		logger,
		blackp,
		ipcbp,
	)

	httpServ := unifiedhttp.NewUnifiedHTTPServer(
		cfg,
		logger,
		httpMiddleware,
		authorityHTTPServer,
		publicfaucetHTTPServer,
		nameserviceHTTPServer,
	)

	//
	// STEP 5:
	// Unified execute of all the modules.
	//

	// Run in background
	go httpServ.Run()
	defer httpServ.Shutdown()

	go authorityTaskManager.Run()
	defer authorityTaskManager.Shutdown()

	go publicfaucetTaskManager.Run()
	defer publicfaucetTaskManager.Shutdown()

	go nameserviceTaskManager.Run()
	defer nameserviceTaskManager.Shutdown()
	logger.Info("ComicCoin Authority is running.")

	<-done
}
