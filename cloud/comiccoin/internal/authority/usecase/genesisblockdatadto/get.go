package genesisblockdatadto

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/domain"
)

type GetGenesisBlockDataDTOFromBlockchainAuthorityUseCase interface {
	Execute(ctx context.Context, chainID uint16) (*domain.GenesisBlockDataDTO, error)
}

type getGenesisBlockDataDTOFromBlockchainAuthorityUseCaseImpl struct {
	logger *slog.Logger
	repo   domain.GenesisBlockDataDTORepository
}

func NewGetGenesisBlockDataDTOFromBlockchainAuthorityUseCase(logger *slog.Logger, repo domain.GenesisBlockDataDTORepository) GetGenesisBlockDataDTOFromBlockchainAuthorityUseCase {
	return &getGenesisBlockDataDTOFromBlockchainAuthorityUseCaseImpl{logger, repo}
}

func (uc *getGenesisBlockDataDTOFromBlockchainAuthorityUseCaseImpl) Execute(ctx context.Context, chainID uint16) (*domain.GenesisBlockDataDTO, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if chainID == 0 {
		e["chain_id"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed getting genesis block",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Insert into database.
	//

	return uc.repo.GetFromBlockchainAuthorityByChainID(ctx, chainID)
}
