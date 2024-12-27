package usecase

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"
)

type GetGenesisBlockDataUseCase struct {
	logger *slog.Logger
	repo   domain.GenesisBlockDataRepository
}

func NewGetGenesisBlockDataUseCase(logger *slog.Logger, repo domain.GenesisBlockDataRepository) *GetGenesisBlockDataUseCase {
	return &GetGenesisBlockDataUseCase{logger, repo}
}

func (uc *GetGenesisBlockDataUseCase) Execute(ctx context.Context, chainID uint16) (*domain.GenesisBlockData, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if chainID == 0 {
		e["chainID"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed getting genesis block",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Get from database.
	//

	blockData, err := uc.repo.GetByChainID(ctx, chainID)
	if err != nil {
		uc.logger.Error("failed getting block data by hash",
			slog.Any("chainID", chainID),
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
