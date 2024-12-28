package usecase

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"
)

type GetBlockDataUseCase struct {
	logger *slog.Logger
	repo   domain.BlockDataRepository
}

func NewGetBlockDataUseCase(logger *slog.Logger, repo domain.BlockDataRepository) *GetBlockDataUseCase {
	return &GetBlockDataUseCase{logger, repo}
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

	blockData, err := uc.repo.GetByHash(ctx, hash)
	if err != nil {
		uc.logger.Error("failed getting block data by hash",
			slog.Any("hash", hash),
			slog.Any("error", err))
		return nil, err
	}

	//
	// STEP 3: Apply minor changes.
	//

	if blockData != nil {
		// Convert a few `*big.Int` fields into string before returning result.
		blockData.Header.NumberString = blockData.Header.GetNumber().String()
		blockData.Header.NonceString = blockData.Header.GetNonce().String()
		blockData.Header.LatestTokenIDString = blockData.Header.GetLatestTokenID().String()
		for i := range blockData.Trans {
			blockData.Trans[i].DataString = string(blockData.Trans[i].Data)
			blockData.Trans[i].NonceString = blockData.Trans[i].GetNonce().String()
			blockData.Trans[i].TokenIDString = blockData.Trans[i].GetTokenID().String()
			blockData.Trans[i].TokenNonceString = blockData.Trans[i].GetTokenNonce().String()
		}
		return blockData, nil
	}

	return nil, nil
}
