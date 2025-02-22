package task

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
)

type TaskManager interface {
	Run()
	Shutdown(ctx context.Context)
}

type taskManagerImpl struct {
	cfg    *config.Configuration
	logger *slog.Logger
}

func NewTaskManager(
	cfg *config.Configuration,
	logger *slog.Logger,

) TaskManager {
	port := &taskManagerImpl{
		cfg:    cfg,
		logger: logger,
	}
	return port
}

func (port *taskManagerImpl) Run() {
	port.logger.Info("Running Task Manager")
}

func (port *taskManagerImpl) Shutdown(ctx context.Context) {
	port.logger.Info("Gracefully shutting down Task Manager")
}
