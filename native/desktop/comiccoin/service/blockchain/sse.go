package blockchain

import (
	"context"
	"log"
	"log/slog"
	"strings"
	"time"

	uc_blockchainstate "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/usecase/blockchainstate"
	uc_storagetransaction "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/usecase/storagetransaction"
)

type BlockchainSyncWithBlockchainAuthorityViaServerSentEventsService interface {
	Execute(ctx context.Context, chainID uint16) error
}

type blockchainSyncWithBlockchainAuthorityViaServerSentEventsServiceImpl struct {
	logger                                                                   *slog.Logger
	blockchainSyncWithBlockchainAuthorityService                             BlockchainSyncWithBlockchainAuthorityService
	storageTransactionOpenUseCase                                            uc_storagetransaction.StorageTransactionOpenUseCase
	storageTransactionCommitUseCase                                          uc_storagetransaction.StorageTransactionCommitUseCase
	storageTransactionDiscardUseCase                                         uc_storagetransaction.StorageTransactionDiscardUseCase
	getBlockchainStateUseCase                                                uc_blockchainstate.GetBlockchainStateUseCase
	subscribeToBlockchainStateServerSentEventsFromBlockchainAuthorityUseCase uc_blockchainstate.SubscribeToBlockchainStateServerSentEventsFromBlockchainAuthorityUseCase
}

func NewBlockchainSyncWithBlockchainAuthorityViaServerSentEventsService(
	logger *slog.Logger,
	s1 BlockchainSyncWithBlockchainAuthorityService,
	uc1 uc_storagetransaction.StorageTransactionOpenUseCase,
	uc2 uc_storagetransaction.StorageTransactionCommitUseCase,
	uc3 uc_storagetransaction.StorageTransactionDiscardUseCase,
	uc4 uc_blockchainstate.GetBlockchainStateUseCase,
	uc5 uc_blockchainstate.SubscribeToBlockchainStateServerSentEventsFromBlockchainAuthorityUseCase,
) BlockchainSyncWithBlockchainAuthorityViaServerSentEventsService {
	return &blockchainSyncWithBlockchainAuthorityViaServerSentEventsServiceImpl{logger, s1, uc1, uc2, uc3, uc4, uc5}
}

func (s *blockchainSyncWithBlockchainAuthorityViaServerSentEventsServiceImpl) Execute(ctx context.Context, chainID uint16) error {
	// Fetch our local blockchain state.
	localBlockchainState, err := s.getBlockchainStateUseCase.Execute(ctx, chainID)
	if err != nil {
		s.logger.Error("Failed getting local blockchain state",
			slog.Any("chain_id", chainID),
			slog.Any("error", err))
		return err
	}

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
		if localBlockchainState == nil {
			s.logger.Debug("Received from global blockchain network... skipping for now as we are not ready...",
				slog.Any("chain_id", chainID),
				slog.Any("latest_hash", blockchainStateLatestHash))
			continue
		}

		// // For debugging purposes only. (Uncommenting will make for noisy console logs)
		// s.logger.Debug("Received from global blockchain network...",
		// 	slog.Any("chain_id", chainID),
		// 	slog.Any("latest_hash", blockchainStateLatestHash))

		//
		// STEP 3:
		// Check to see if the local blockchain we have locally is the same with
		// the Global Blockchain Network and if there differences then we must
		// sync immediately.
		//

		if localBlockchainState.LatestHash != blockchainStateLatestHash {

			if err := s.storageTransactionOpenUseCase.Execute(); err != nil {
				s.storageTransactionDiscardUseCase.Execute()
				log.Fatalf("Failed to open storage transaction: %v\n", err)
			}

			if err := s.blockchainSyncWithBlockchainAuthorityService.Execute(ctx, chainID); err != nil {
				s.storageTransactionDiscardUseCase.Execute()
				log.Fatalf("Failed to sync blockchain: %v\n", err)
			}

			if err := s.storageTransactionCommitUseCase.Execute(); err != nil {
				s.storageTransactionDiscardUseCase.Execute()
				log.Fatalf("Failed to open storage transaction: %v\n", err)
			}

			// DEVELOPERS NOTE:
			// Before we finish this runtime loop, and for debugging purposes, let
			// us print this helpful message to communicate to the user that we
			// are waiting for the next request.
			s.logger.Debug("Waiting to receive from the global blockchain network...",
				slog.Any("chain_id", chainID))
		}

	}

	s.logger.Debug("Subscription to blockchain authority closed",
		slog.Any("chain_id", chainID))

	return nil
}
