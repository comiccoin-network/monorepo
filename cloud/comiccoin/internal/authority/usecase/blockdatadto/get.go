package blockdatadto

import (
	"context"
	"log/slog"
	"math/big"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/domain"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
)

type GetBlockDataDTOFromBlockchainAuthorityUseCase interface {
	ExecuteByHash(ctx context.Context, hash string) (*domain.BlockDataDTO, error)
	ExecuteByHeaderNumber(ctx context.Context, headerNumber *big.Int) (*domain.BlockDataDTO, error)
}

type getBlockDataDTOFromBlockchainAuthorityUseCaseImpl struct {
	logger *slog.Logger
	repo   domain.BlockDataDTORepository
}

func NewGetBlockDataDTOFromBlockchainAuthorityUseCase(logger *slog.Logger, repo domain.BlockDataDTORepository) GetBlockDataDTOFromBlockchainAuthorityUseCase {
	return &getBlockDataDTOFromBlockchainAuthorityUseCaseImpl{logger, repo}
}

func (uc *getBlockDataDTOFromBlockchainAuthorityUseCaseImpl) ExecuteByHash(ctx context.Context, hash string) (*domain.BlockDataDTO, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if hash == "" {
		e["hash"] = "missing value"
	}
	if len(e) != 0 {
		// uc.logger.Warn("Validation failed.",
		// 	slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Get from database.
	//

	return uc.repo.GetFromBlockchainAuthorityByHash(ctx, hash)
}

func (uc *getBlockDataDTOFromBlockchainAuthorityUseCaseImpl) ExecuteByHeaderNumber(ctx context.Context, headerNumber *big.Int) (*domain.BlockDataDTO, error) {
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
		// uc.logger.Warn("Validation failed.",
		// 	slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Get from database.
	//

	return uc.repo.GetFromBlockchainAuthorityByHeaderNumber(ctx, headerNumber)
}
