package task

import (
	"context"
	"log/slog"
	"time"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"

	tsk_faucet "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/interface/task/faucet"
)

type TaskManager interface {
	Run()
	Shutdown()
}

type taskManagerImpl struct {
	cfg                                *config.Configuration
	logger                             *slog.Logger
	updateFaucetBalanceByAuthorityTask *tsk_faucet.UpdateFaucetBalanceByAuthorityTask
}

func NewTaskManager(
	cfg *config.Configuration,
	logger *slog.Logger,
	updateFaucetBalanceByAuthorityTask *tsk_faucet.UpdateFaucetBalanceByAuthorityTask,
) TaskManager {
	port := &taskManagerImpl{
		cfg:                                cfg,
		logger:                             logger,
		updateFaucetBalanceByAuthorityTask: updateFaucetBalanceByAuthorityTask,
	}
	return port
}

func (port *taskManagerImpl) Run() {
	port.logger.Info("Running Task Manager")

	//
	// STEP 1:
	// When task running begins, let's fetch from authority.
	//

	if err := port.updateFaucetBalanceByAuthorityTask.Execute(context.Background()); err != nil {
		port.logger.Error("Failed running remote account balance sync - Trying again in 10 seconds...",
			slog.Any("error", err))
		time.Sleep(10 * time.Second)
	}

	//
	// Step 2:
	// Run in background to fetch latest faucet balance.
	//

	for {
		if err := port.updateFaucetBalanceByAuthorityTask.Execute(context.Background()); err != nil {
			port.logger.Error("Failed running remote account balance sync - Trying again in 10 seconds...",
				slog.Any("error", err))
			time.Sleep(10 * time.Second)
			continue
		}
		time.Sleep(1 * time.Hour)
		port.logger.Debug("Finished sync'ing remote account balance, will sync again in 1 hour...")
	}
}

func (port *taskManagerImpl) Shutdown() {
	port.logger.Info("Gracefully shutting down Task Manager")
}
