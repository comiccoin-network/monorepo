package task

import (
	"context"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	tsk_faucet "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/nameservice/interface/task/faucet"
)

type TaskManager interface {
	Run()
	Shutdown()
}

type taskManagerImpl struct {
	cfg                                *config.Configuration
	logger                             *slog.Logger
	dbClient                           *mongo.Client
	updateFaucetBalanceByAuthorityTask *tsk_faucet.UpdateFaucetBalanceByAuthorityTask
}

func NewTaskManager(
	cfg *config.Configuration,
	logger *slog.Logger,
	dbClient *mongo.Client,
	updateFaucetBalanceByAuthorityTask *tsk_faucet.UpdateFaucetBalanceByAuthorityTask,
) TaskManager {
	port := &taskManagerImpl{
		cfg:                                cfg,
		logger:                             logger,
		dbClient:                           dbClient,
		updateFaucetBalanceByAuthorityTask: updateFaucetBalanceByAuthorityTask,
	}
	return port
}

func (port *taskManagerImpl) Run() {
	port.logger.Info("Running Task Manager")
	ctx := context.Background()

	//
	// STEP 1:
	// When task running begins, let's fetch from authority.
	//

	////
	//// Start the transaction.
	////

	session, err := port.dbClient.StartSession()
	if err != nil {
		port.logger.Error("start session error",
			slog.Any("error", err))
		return
	}
	defer session.EndSession(ctx)

	// Define a transaction function with a series of operations
	transactionFunc := func(sessCtx mongo.SessionContext) (interface{}, error) {

		if err := port.updateFaucetBalanceByAuthorityTask.Execute(sessCtx); err != nil {
			port.logger.Error("Failed running remote account balance sync - Trying again in 10 seconds...",
				slog.Any("error", err))
			time.Sleep(10 * time.Second)
		}

		return nil, nil
	}

	// Start a transaction
	_, txErr := session.WithTransaction(ctx, transactionFunc)
	if txErr != nil {
		port.logger.Error("session failed error",
			slog.Any("error", txErr))
		return
	}

	//
	// Step 2:
	// Run in background to fetch latest faucet balance.
	//

	for {
		////
		//// Start the transaction.
		////

		session, err := port.dbClient.StartSession()
		if err != nil {
			port.logger.Error("start session error",
				slog.Any("error", err))
			return
		}
		defer session.EndSession(ctx)

		// Define a transaction function with a series of operations
		transactionFunc := func(sessCtx mongo.SessionContext) (interface{}, error) {

			if err := port.updateFaucetBalanceByAuthorityTask.Execute(sessCtx); err != nil {
				port.logger.Error("Failed running remote account balance sync - Trying again in 10 seconds...",
					slog.Any("error", err))
				time.Sleep(10 * time.Second)
			}

			return nil, nil
		}

		// Start a transaction
		_, txErr := session.WithTransaction(ctx, transactionFunc)
		if txErr != nil {
			port.logger.Error("session failed error",
				slog.Any("error", txErr))
			return
		}

		time.Sleep(1 * time.Hour)
		port.logger.Debug("Finished sync'ing remote account balance, will sync again in 1 hour...")
	}
}

func (port *taskManagerImpl) Shutdown() {
	port.logger.Info("Gracefully shutting down Task Manager")
}
