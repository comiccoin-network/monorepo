package main

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/kmutexutil"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/logger"
)

// App struct
type App struct {
	ctx context.Context

	// Logger instance which provides detailed debugging information along
	// with the console log messages.
	logger *slog.Logger

	kmutex kmutexutil.KMutexProvider
}

// NewApp creates a new App application struct
func NewApp() *App {
	logger := logger.NewProvider()
	kmutex := kmutexutil.NewKMutexProvider()
	return &App{
		logger: logger,
		kmutex: kmutex,
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	// Ensure that this function executes only one time and never concurrently.
	a.kmutex.Acquire("startup")
	defer a.kmutex.Release("startup")

	a.ctx = ctx
	a.logger.Debug("Startup beginning...")

	// DEVELOPERS NOTE:
	// Before we startup our app, we need to make sure the `data directory` is
	// set for this application by the user, else stop the app startup
	// proceedure. This is done on purpose because we need the user to specify
	// the location they want to store instead of having one automatically set.
	preferences := PreferencesInstance()
	dataDir := preferences.DataDirectory
	if dataDir == "" {
		return
	}

	// DEVELOPERS NOTE:
	// Defensive code for programmer in case all the required environment
	// variables are not set then abort this program.
	// preferences.RunFatalIfHasAnyMissingFields() // ONLY USE IN CLI, NOT GUI WALLET!

	nftStorageAddress := preferences.NFTStorageAddress
	chainID := preferences.ChainID
	authorityAddress := preferences.AuthorityAddress

	_ = nftStorageAddress
	_ = chainID
	_ = authorityAddress
}

func (a *App) shutdown(ctx context.Context) {
	a.logger.Debug("Shutting down now...")
	defer a.logger.Debug("Shutting down finished")

	// DEVELOPERS NOTE:
	// Before we startup our app, we need to make sure the `data directory` is
	// set for this application by the user, else stop the app startup
	// procedure. This is done on purpose because we need the user to specify
	// the location they want to store instead of having one automatically set.
	preferences := PreferencesInstance()
	dataDir := preferences.DataDirectory
	if dataDir == "" {
		return
	}
}
