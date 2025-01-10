package blockchainstate

import (
	"context"
	"errors"
	"log"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"
)

type BlockchainStateUpdateDetectorUseCase interface {
	Execute(ctx context.Context) (*domain.BlockchainState, error)
	Terminate()
}

type blockchainStateUpdateDetectorUseCaseImpl struct {
	config   *config.Configuration
	logger   *slog.Logger
	repo     domain.BlockchainStateRepository
	dataChan <-chan domain.BlockchainState
	quitChan chan struct{}
}

func NewBlockchainStateUpdateDetectorUseCase(config *config.Configuration, logger *slog.Logger, repo domain.BlockchainStateRepository) BlockchainStateUpdateDetectorUseCase {
	dataChan, quitChan, err := repo.GetUpdateChangeStreamChannel(context.Background())
	if err != nil {
		log.Fatalf("NewBlockchainStateUpdateDetectorUseCase: Failed initializing use-case: %v\n", err)
	}
	return &blockchainStateUpdateDetectorUseCaseImpl{config, logger, repo, dataChan, quitChan}
}

func (uc *blockchainStateUpdateDetectorUseCaseImpl) Execute(ctx context.Context) (*domain.BlockchainState, error) {
	// uc.logger.Debug("Waiting to receive...")
	select {
	case blockchainState, ok := <-uc.dataChan:
		if !ok {
			// uc.logger.Debug("Error receiving.")
			return nil, errors.New("channel closed")
		}
		// uc.logger.Debug("Data received.",
		// 	slog.Any("dataChan", newEntry))

		return &blockchainState, nil
	case <-ctx.Done():
		// uc.logger.Debug("Done receiving.")
		return nil, ctx.Err()
	}
}

// Terminate releases the channel resource
func (uc *blockchainStateUpdateDetectorUseCaseImpl) Terminate() {
	uc.logger.Debug("Closing change stream connection...")
	close(uc.quitChan)
}
