package service

import (
	"context"
	"log/slog"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/config/constants"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/domain"
	uc_blockchainstate "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/blockchainstate"
	uc_blockchainstatesse "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/blockchainstatesse"
)

type BlockchainSyncWithBlockchainAuthorityViaServerSentEventsService struct {
	config                                                                   *config.Configuration
	logger                                                                   *slog.Logger
	dbClient                                                                 *mongo.Client
	blockchainSyncWithBlockchainAuthorityService                             *BlockchainSyncWithBlockchainAuthorityService
	getBlockchainStateUseCase                                                *uc_blockchainstate.GetBlockchainStateUseCase
	subscribeToBlockchainStateServerSentEventsFromBlockchainAuthorityUseCase *uc_blockchainstatesse.SubscribeToBlockchainStateServerSentEventsFromBlockchainAuthorityUseCase
}

func NewBlockchainSyncWithBlockchainAuthorityViaServerSentEventsService(
	cfg *config.Configuration,
	logger *slog.Logger,
	dbClient *mongo.Client,
	s1 *BlockchainSyncWithBlockchainAuthorityService,
	uc1 *uc_blockchainstate.GetBlockchainStateUseCase,
	uc2 *uc_blockchainstatesse.SubscribeToBlockchainStateServerSentEventsFromBlockchainAuthorityUseCase,
) *BlockchainSyncWithBlockchainAuthorityViaServerSentEventsService {
	return &BlockchainSyncWithBlockchainAuthorityViaServerSentEventsService{cfg, logger, dbClient, s1, uc1, uc2}
}

func (s *BlockchainSyncWithBlockchainAuthorityViaServerSentEventsService) Execute(ctx context.Context) error {
	chainID := s.config.Blockchain.ChainID

	//
	// STEP 1:
	// Lookup the current blockchain state we have locally.
	//

	session, err := s.dbClient.StartSession()
	if err != nil {
		s.logger.Error("start session error",
			slog.Any("error", err))
		return err
	}
	defer session.EndSession(ctx)

	// Define a transaction function with a series of operations
	transactionFunc := func(sessCtx mongo.SessionContext) (interface{}, error) {
		blockchainState, err := s.getBlockchainStateUseCase.Execute(sessCtx, s.config.Blockchain.ChainID)
		if err != nil {
			s.logger.Warn("Failed getting entire blockchain from authority",
				slog.Any("error", err))
			return nil, err
		}
		return blockchainState, nil
	}

	// Start a transaction
	blockchainStateResp, txErr := session.WithTransaction(ctx, transactionFunc)
	if txErr != nil {
		s.logger.Error("session failed error",
			slog.Any("error", txErr))
		return txErr
	}

	blockchainState := blockchainStateResp.(*domain.BlockchainState)

	//
	// STEP 2:
	// Wait to receive `server sent  events` of the Blockchain Authority to get
	// the latest updates about changes with the global blockchain network.
	// Note: The authority will only send the latest hash.
	//

	ipAddress, _ := ctx.Value(constants.SessionIPAddress).(string)
	s.logger.Debug("Waiting to receive from the global blockchain network...",
		slog.Any("chain_id", chainID),
		slog.Any("my_ip", ipAddress),
	)

	// DEVELOPERS NOTE: Absolutely do not surround this code with a MongoDB
	// transaction because this code hangs a lot (it's dependent on Authority
	// sending latest updates) and thus would hang the MongoDB transaction
	// and cause errors. Leave this context as is!
	blockchainAuthorityChannel, err := s.subscribeToBlockchainStateServerSentEventsFromBlockchainAuthorityUseCase.Execute(ctx, chainID)
	if err != nil {
		if strings.Contains(err.Error(), "received non-OK HTTP status: 524") {
			s.logger.Warn("Failed subscribing because of timeout, will retry again in 10 seconds...",
				slog.Any("chainID", chainID),
				slog.Any("error", err))
			time.Sleep(10 * time.Second)
			return nil
		}

		s.logger.Error("Failed subscribing...",
			slog.Any("chainID", chainID),
			slog.Any("error", err))
		return err
	}

	for blockchainStateLatestHash := range blockchainAuthorityChannel {
		// What is the purpose of this? In case our local database is not setup
		// then we skip handling any Global Blockchain state changes until we
		// are setup.
		if blockchainState == nil {
			s.logger.Debug("Received from global blockchain network...skipping for now...",
				slog.Any("chain_id", chainID),
				slog.Any("latest_hash", blockchainStateLatestHash))
			continue
		}

		// For debugging purposes only. (Uncommenting will make for noisy console logs)
		// s.logger.Debug("Received from global blockchain network...",
		// 	slog.Any("chain_id", chainID),
		// 	slog.Any("latest_hash", blockchainStateLatestHash))

		//
		// STEP 3:
		// Check to see if the local blockchain we have locally is the same with
		// the Global Blockchain Network and if there differences then we must
		// sync immediately.
		//

		if blockchainState.LatestHash != blockchainStateLatestHash {
			session, err := s.dbClient.StartSession()
			if err != nil {
				s.logger.Error("start session error",
					slog.Any("error", err))
				return err
			}
			defer session.EndSession(ctx)

			// Define a transaction function with a series of operations
			transactionFunc := func(sessCtx mongo.SessionContext) (interface{}, error) {
				if err := s.blockchainSyncWithBlockchainAuthorityService.Execute(sessCtx); err != nil {
					s.logger.Warn("Failed syncing with authority",
						slog.Any("chainID", chainID),
						slog.Any("error", err))
					return nil, err
				}
				return nil, nil
			}

			// Start a transaction
			_, txErr := session.WithTransaction(ctx, transactionFunc)
			if txErr != nil {
				s.logger.Error("session failed error",
					slog.Any("error", txErr))
				return txErr
			}

			// DEVELOPERS NOTE:
			// Before we finish this runtime loop, and for debugging purposes, let
			// us print this helpful message to communicate to the user that we
			// are waiting for the next request.
			s.logger.Debug("Waiting to receive from the global blockchain network...",
				slog.Any("chain_id", chainID))
		}

	}

	s.logger.Debug("Subscription to blockchain faucet closed",
		slog.Any("chain_id", chainID))

	return nil
}
