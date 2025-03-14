package genesisblockdata

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	authority_domain "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"
	uc_genesisblockdatadto "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/genesisblockdatadto"

	uc_genesisblockdata "github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/usecase/genesisblockdata"
)

type GenesisBlockDataGetOrSyncService interface {
	Execute(ctx context.Context, chainID uint16) (*authority_domain.GenesisBlockData, error)
}

type genesisBlockDataGetOrSyncServiceImpl struct {
	logger                                               *slog.Logger
	getGenesisBlockDataUseCase                           uc_genesisblockdata.GetGenesisBlockDataUseCase
	upsertGenesisBlockDataUseCase                        uc_genesisblockdata.UpsertGenesisBlockDataUseCase
	getGenesisBlockDataDTOFromBlockchainAuthorityUseCase uc_genesisblockdatadto.GetGenesisBlockDataDTOFromBlockchainAuthorityUseCase
}

func NewGenesisBlockDataGetOrSyncService(
	logger *slog.Logger,
	uc1 uc_genesisblockdata.GetGenesisBlockDataUseCase,
	uc2 uc_genesisblockdata.UpsertGenesisBlockDataUseCase,
	uc3 uc_genesisblockdatadto.GetGenesisBlockDataDTOFromBlockchainAuthorityUseCase,
) GenesisBlockDataGetOrSyncService {
	return &genesisBlockDataGetOrSyncServiceImpl{logger, uc1, uc2, uc3}
}

// Execute method gets genesis block data from authority if we don't have it locally, else gets genesis from local source.
func (s *genesisBlockDataGetOrSyncServiceImpl) Execute(ctx context.Context, chainID uint16) (*authority_domain.GenesisBlockData, error) {
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
	// STEP 2: Check if genesis block already exists locally
	//

	genesis, err := s.getGenesisBlockDataUseCase.Execute(ctx, chainID)
	if err != nil {
		s.logger.Error("Failed getting genesis block locally",
			slog.Any("chain_id", chainID),
			slog.Any("error", err))
		return nil, err
	}

	// If genesis block already exists then we do not need to fetch remotely,
	// just return the genesis block as is.
	if genesis != nil {
		return genesis, nil
	}

	//
	// STEP 3: Download from remote service.
	//

	genesisDTO, err := s.getGenesisBlockDataDTOFromBlockchainAuthorityUseCase.Execute(ctx, chainID)
	if err != nil {
		s.logger.Error("Failed getting genesis block remotely",
			slog.Any("chain_id", chainID),
			slog.Any("error", err))
		return nil, err
	}
	if genesisDTO == nil {
		err := fmt.Errorf("Genesis block data does not exist for `chain_id`: %v", chainID)
		s.logger.Error("Failed getting genesis block remotely",
			slog.Any("chain_id", chainID),
			slog.Any("error", err))
		return nil, err
	}

	// Convert from network format data to our local format.
	genesis = authority_domain.GenesisBlockDataDTOToGenesisBlockData(genesisDTO)

	// Save the genesis block data to local database.
	if err := s.upsertGenesisBlockDataUseCase.Execute(ctx, genesis.Hash, genesis.Header, genesis.HeaderSignatureBytes, genesis.Trans, genesis.Validator); err != nil {
		s.logger.Error("Failed upserting genesis",
			slog.Any("chain_id", chainID),
			slog.Any("error", err))
		return nil, err
	}

	return genesis, nil
}
