package usecase

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/domain"
)

//
// Copied from `github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase`
//

type GetGenesisBlockDataDTOFromBlockchainAuthorityUseCase struct {
	logger *slog.Logger
	repo   domain.GenesisBlockDataDTORepository
}

func NewGetGenesisBlockDataDTOFromBlockchainAuthorityUseCase(logger *slog.Logger, repo domain.GenesisBlockDataDTORepository) *GetGenesisBlockDataDTOFromBlockchainAuthorityUseCase {
	return &GetGenesisBlockDataDTOFromBlockchainAuthorityUseCase{logger, repo}
}

func (uc *GetGenesisBlockDataDTOFromBlockchainAuthorityUseCase) Execute(ctx context.Context, chainID uint16) (*domain.GenesisBlockDataDTO, error) {
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
