package blockdata

import (
	"context"
	"log/slog"
	"strings"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"
)

type GetByBlockTransactionTimestampUseCase struct {
	logger *slog.Logger
	repo   domain.BlockDataRepository
}

func NewGetByBlockTransactionTimestampUseCase(logger *slog.Logger, repo domain.BlockDataRepository) *GetByBlockTransactionTimestampUseCase {
	return &GetByBlockTransactionTimestampUseCase{logger, repo}
}

func (uc *GetByBlockTransactionTimestampUseCase) Execute(ctx context.Context, timestamp uint64) (*domain.BlockData, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if timestamp == 0 {
		e["timestamp"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed validating",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Get from database.
	//

	blockData, err := uc.repo.GetByBlockTransactionTimestamp(ctx, timestamp)
	if err != nil {
		if !strings.Contains(err.Error(), "does not exist") {
			uc.logger.Error("failed getting block data by timestamp",
				slog.Any("timestamp", timestamp),
				slog.Any("error", err))
			return nil, err
		}
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
