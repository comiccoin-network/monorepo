package blockchainstatedto

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/domain"
)

//
// Copied from `github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase`
//

type GetBlockchainStateDTOFromBlockchainAuthorityUseCase struct {
	logger *slog.Logger
	repo   domain.BlockchainStateDTORepository
}

func NewGetBlockchainStateDTOFromBlockchainAuthorityUseCase(logger *slog.Logger, repo domain.BlockchainStateDTORepository) *GetBlockchainStateDTOFromBlockchainAuthorityUseCase {
	return &GetBlockchainStateDTOFromBlockchainAuthorityUseCase{logger, repo}
}

func (uc *GetBlockchainStateDTOFromBlockchainAuthorityUseCase) Execute(ctx context.Context, chainID uint16) (*domain.BlockchainStateDTO, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if chainID == 0 {
		e["chain_id"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed getting blockchain state",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Insert into database.
	//

	return uc.repo.GetFromBlockchainAuthorityByChainID(ctx, chainID)
}
