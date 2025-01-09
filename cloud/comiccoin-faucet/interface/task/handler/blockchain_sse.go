package handler

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/config"
	sv_blockchain "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/service/blockchain"
)

type BlockchainSyncWithBlockchainAuthorityViaServerSentEventsTaskHandler struct {
	config                                       *config.Configuration
	logger                                       *slog.Logger
	dbClient                                     *mongo.Client
	blockchainSyncWithBlockchainAuthorityService *sv_blockchain.BlockchainSyncWithBlockchainAuthorityViaServerSentEventsService
}

func NewBlockchainSyncWithBlockchainAuthorityViaServerSentEventsTaskHandler(
	config *config.Configuration,
	logger *slog.Logger,
	dbClient *mongo.Client,
	s1 *sv_blockchain.BlockchainSyncWithBlockchainAuthorityViaServerSentEventsService,
) *BlockchainSyncWithBlockchainAuthorityViaServerSentEventsTaskHandler {
	return &BlockchainSyncWithBlockchainAuthorityViaServerSentEventsTaskHandler{config, logger, dbClient, s1}
}

func (h *BlockchainSyncWithBlockchainAuthorityViaServerSentEventsTaskHandler) Execute(ctx context.Context) error {
	session, err := h.dbClient.StartSession()
	if err != nil {
		h.logger.Error("start session error",
			slog.Any("error", err))
		return err
	}
	defer session.EndSession(ctx)

	// Define a transaction function with a series of operations
	transactionFunc := func(sessCtx mongo.SessionContext) (interface{}, error) {
		return nil, h.blockchainSyncWithBlockchainAuthorityService.Execute(sessCtx)
	}

	// Start a transaction
	_, txErr := session.WithTransaction(ctx, transactionFunc)
	if txErr != nil {
		h.logger.Error("session failed error",
			slog.Any("error", txErr))
		return txErr
	}
	return nil
}
