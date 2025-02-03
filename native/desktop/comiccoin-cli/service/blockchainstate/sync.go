package blockchainstate

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	authority_domain "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"
	uc_blockchainstatedto "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/blockchainstatedto"

	uc_blockchainstate "github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/usecase/blockchainstate"
)

type BlockchainStateSyncService interface {
	Execute(ctx context.Context, chainID uint16) (*authority_domain.BlockchainState, error)
}

type blockchainStateSyncServiceImpl struct {
	logger                                              *slog.Logger
	getBlockchainStateDTOFromBlockchainAuthorityUseCase uc_blockchainstatedto.GetBlockchainStateDTOFromBlockchainAuthorityUseCase
	upsertBlockchainStateUseCase                        uc_blockchainstate.UpsertBlockchainStateUseCase
}

func NewBlockchainStateSyncService(
	logger *slog.Logger,
	uc1 uc_blockchainstatedto.GetBlockchainStateDTOFromBlockchainAuthorityUseCase,
	uc2 uc_blockchainstate.UpsertBlockchainStateUseCase,
) BlockchainStateSyncService {
	return &blockchainStateSyncServiceImpl{logger, uc1, uc2}
}

// Execute method gets genesis block data from authority if we don't have it locally, else gets genesis from local source.
func (s *blockchainStateSyncServiceImpl) Execute(ctx context.Context, chainID uint16) (*authority_domain.BlockchainState, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if chainID == 0 {
		e["chainID"] = "missing value"
	}
	if len(e) != 0 {
		s.logger.Warn("Validation failed",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Download from remote service.
	//

	blockchainStateDTO, err := s.getBlockchainStateDTOFromBlockchainAuthorityUseCase.Execute(ctx, chainID)
	if err != nil {
		s.logger.Error("Failed getting blockchain state remotely",
			slog.Any("chain_id", chainID),
			slog.Any("error", err))
		return nil, err
	}
	if blockchainStateDTO == nil {
		err := fmt.Errorf("Blockchain state does not exist for `chain_id`: %v", chainID)
		s.logger.Error("Failed getting blockchain state remotely",
			slog.Any("chain_id", chainID),
			slog.Any("error", err))
		return nil, err
	}

	// Convert from network format data to our local format.
	blockchainState := authority_domain.BlockchainStateDTOToBlockchainState(blockchainStateDTO)

	// Save the genesis block data to local database.
	if err := s.upsertBlockchainStateUseCase.Execute(ctx, blockchainState); err != nil {
		s.logger.Error("Failed upserting blockchain state",
			slog.Any("chain_id", chainID),
			slog.Any("error", err))
		return nil, err
	}

	return blockchainState, nil
}
