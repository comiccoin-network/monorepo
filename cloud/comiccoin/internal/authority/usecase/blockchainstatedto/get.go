package blockchainstatedto

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/domain"
)

type GetBlockchainStateDTOFromBlockchainAuthorityUseCase interface {
	Execute(ctx context.Context, chainID uint16) (*domain.BlockchainStateDTO, error)
}

type getBlockchainStateDTOFromBlockchainAuthorityUseCaseImpl struct {
	logger *slog.Logger
	repo   domain.BlockchainStateDTORepository
}

func NewGetBlockchainStateDTOFromBlockchainAuthorityUseCase(logger *slog.Logger, repo domain.BlockchainStateDTORepository) GetBlockchainStateDTOFromBlockchainAuthorityUseCase {
	return &getBlockchainStateDTOFromBlockchainAuthorityUseCaseImpl{logger, repo}
}

func (uc *getBlockchainStateDTOFromBlockchainAuthorityUseCaseImpl) Execute(ctx context.Context, chainID uint16) (*domain.BlockchainStateDTO, error) {
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
