package blocktx

import (
	"context"
	"fmt"
	"log/slog"
	"math/big"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"
)

type GetBlockTransactionUseCase interface {
	ExecuteByNonce(ctx context.Context, txNonce *big.Int) (*domain.BlockTransaction, error)
}

type getBlockTransactionUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   domain.BlockDataRepository
}

func NewGetBlockTransactionUseCase(config *config.Configuration, logger *slog.Logger, repo domain.BlockDataRepository) GetBlockTransactionUseCase {
	return &getBlockTransactionUseCaseImpl{config, logger, repo}
}

func (uc *getBlockTransactionUseCaseImpl) ExecuteByNonce(ctx context.Context, txNonce *big.Int) (*domain.BlockTransaction, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)

	if txNonce == nil {
		e["nonce"] = "Nonce is required"
	} else {
		// // Special thanks to "Is there another way of testing if a big.Int is 0?" via https://stackoverflow.com/a/64257532
		// if len(headerNumber.Bits()) == 0 {
		// 	e["header_number"] = "Header number is required"
		// }
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed validating",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Get from database.
	//

	blockData, err := uc.repo.GetByTransactionNonce(ctx, txNonce)
	if err != nil {
		uc.logger.Error("Failed getting block transactions by nonce",
			slog.Any("error", err))
		return nil, err
	}
	if blockData == nil {
		uc.logger.Warn("Nothing returned for getting block transactions by nonce",
			slog.Any("error", err))
		return nil, nil
	}

	//
	// STEP 3: Get the specific record.
	//

	for _, v := range blockData.Trans {
		if v.SignedTransaction.Transaction.GetNonce().Cmp(txNonce) == 0 {
			return &v, nil
		}
	}
	return nil, fmt.Errorf("Block transaction not found for nonce %v in the found block data", txNonce)
}
