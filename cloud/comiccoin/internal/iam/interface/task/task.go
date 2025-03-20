package task

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
)

type TaskManager interface {
	Run()
	Shutdown()
}

type taskManagerImpl struct {
	cfg      *config.Configuration
	logger   *slog.Logger
	dbClient *mongo.Client
}

func NewTaskManager(
	cfg *config.Configuration,
	logger *slog.Logger,
	dbClient *mongo.Client,
) TaskManager {
	port := &taskManagerImpl{
		cfg:      cfg,
		logger:   logger,
		dbClient: dbClient,
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
		// Do nothing ... for now! But later fill with one-time startup code.
		return nil, nil
	}

	// Start a transaction
	_, txErr := session.WithTransaction(ctx, transactionFunc)
	if txErr != nil {
		port.logger.Error("session failed error",
			slog.Any("error", txErr))
		return
	}
}

func (port *taskManagerImpl) Shutdown() {
	port.logger.Info("Gracefully shutting down Task Manager")
}
