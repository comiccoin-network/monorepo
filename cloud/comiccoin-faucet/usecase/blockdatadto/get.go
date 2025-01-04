package blockdatadto

import (
	"context"
	"log/slog"
	"math/big"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/domain"
)

//
// Copied from `github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase`
//

type GetBlockDataDTOFromBlockchainAuthorityUseCase struct {
	logger *slog.Logger
	repo   domain.BlockDataDTORepository
}

func NewGetBlockDataDTOFromBlockchainAuthorityUseCase(logger *slog.Logger, repo domain.BlockDataDTORepository) *GetBlockDataDTOFromBlockchainAuthorityUseCase {
	return &GetBlockDataDTOFromBlockchainAuthorityUseCase{logger, repo}
}

func (uc *GetBlockDataDTOFromBlockchainAuthorityUseCase) ExecuteByHash(ctx context.Context, hash string) (*domain.BlockDataDTO, error) {
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
	// STEP 2: Get from database.
	//

	return uc.repo.GetFromBlockchainAuthorityByHash(ctx, hash)
}

func (uc *GetBlockDataDTOFromBlockchainAuthorityUseCase) ExecuteByHeaderNumber(ctx context.Context, headerNumber *big.Int) (*domain.BlockDataDTO, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if headerNumber == nil {
		e["header_number"] = "Header number is required"
	} else {
		// // Special thanks to "Is there another way of testing if a big.Int is 0?" via https://stackoverflow.com/a/64257532
		// if len(headerNumber.Bits()) == 0 {
		// 	e["header_number"] = "Header number is required"
		// }
	}
	if len(e) != 0 {
		uc.logger.Warn("Validation failed.",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Get from database.
	//

	return uc.repo.GetFromBlockchainAuthorityByHeaderNumber(ctx, headerNumber)
}
