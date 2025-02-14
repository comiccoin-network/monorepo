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
	cache "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/storage/memory/redis"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/unifiedhttp"
	unifiedmiddleware "github.com/comiccoin-network/monorepo/cloud/comiccoin/unifiedhttp/middleware"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority"
)

func DaemonCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "daemon",
		Short: "Run the ComicCoin Authority fullnode",
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
	cachep := cache.NewCache(cfg, logger)
	dmutex := distributedmutex.NewAdapter(logger, cachep.GetRedisClient())
	ipcbp := ipcb.NewProvider(cfg, logger)

	//
	// STEP 3
	// Load up our modules.
	//

	authorityServer := authority.NewServer(
		cfg,
		logger,
		dbClient,
		keystore,
		passp,
		jwtp,
		blackp,
		cachep,
		dmutex,
		ipcbp,
	)

	authorityHTTPServer := authorityServer.GetHTTPServerInstance()

	//
	// STEP 4:
	// Initialize our unified http server and task manager
	//

	httpMiddleware := unifiedmiddleware.NewMiddleware(
		logger,
		blackp,
		ipcbp,
	)

	httpServ := unifiedhttp.NewUnifiedHTTPServer(cfg, logger, httpMiddleware, authorityHTTPServer)

	//
	// STEP 5:
	// Unified execute of all the modules.
	//

	// Run in background
	go httpServ.Run()
	defer httpServ.Shutdown()
	// go taskManager.Run()
	// defer taskManager.Shutdown()

	logger.Info("ComicCoin Authority is running.")

	<-done
}
