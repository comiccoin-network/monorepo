package usecase

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"
)

type GetBlockDataDTOFromBlockchainAuthorityUseCase struct {
	logger *slog.Logger
	repo   domain.BlockDataDTORepository
}

func NewGetBlockDataDTOFromBlockchainAuthorityUseCase(logger *slog.Logger, repo domain.BlockDataDTORepository) *GetBlockDataDTOFromBlockchainAuthorityUseCase {
	return &GetBlockDataDTOFromBlockchainAuthorityUseCase{logger, repo}
}

func (uc *GetBlockDataDTOFromBlockchainAuthorityUseCase) Execute(ctx context.Context, hash string) (*domain.BlockDataDTO, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if hash == "" {
		e["hash"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("Validation failed.",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Insert into database.
	//

	return uc.repo.GetFromBlockchainAuthorityByHash(ctx, hash)
}
