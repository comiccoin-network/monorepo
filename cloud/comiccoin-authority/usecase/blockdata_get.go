package usecase

import (
	"context"
	"log/slog"
	"math/big"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"
)

type GetBlockDataUseCase struct {
	config *config.Configuration
	logger *slog.Logger
	repo   domain.BlockDataRepository
}

func NewGetBlockDataUseCase(config *config.Configuration, logger *slog.Logger, repo domain.BlockDataRepository) *GetBlockDataUseCase {
	return &GetBlockDataUseCase{config, logger, repo}
}

func (uc *GetBlockDataUseCase) ExecuteByHash(ctx context.Context, hash string) (*domain.BlockData, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if hash == "" {
		e["hash"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed getting account",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Get from database.
	//

	return uc.repo.GetByHash(ctx, hash)
}

func (uc *GetBlockDataUseCase) ExecuteByHeaderNumber(ctx context.Context, headerNumber *big.Int) (*domain.BlockData, error) {
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
		uc.logger.Warn("Failed getting account",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Get from database.
	//

	return uc.repo.GetByHeaderNumber(ctx, headerNumber)
}
