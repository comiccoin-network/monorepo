package blocktx

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"
	"github.com/ethereum/go-ethereum/common"
)

type ListWithLimitBlockTransactionsByAddressUseCase interface {
	Execute(ctx context.Context, address *common.Address, limit int64) ([]*domain.BlockTransaction, error)
}

type listWithLimitBlockTransactionsByAddressUseCaseImpl struct {
	logger *slog.Logger
	repo   domain.BlockDataRepository
}

func NewListWithLimitBlockTransactionsByAddressUseCase(logger *slog.Logger, repo domain.BlockDataRepository) ListWithLimitBlockTransactionsByAddressUseCase {
	return &listWithLimitBlockTransactionsByAddressUseCaseImpl{logger, repo}
}

func (uc *listWithLimitBlockTransactionsByAddressUseCaseImpl) Execute(ctx context.Context, address *common.Address, limit int64) ([]*domain.BlockTransaction, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if address == nil {
		e["address"] = "missing value"
	}
	if limit == 0 {
		e["limit"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed getting account",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2:  List from database.
	//

	res, err := uc.repo.ListWithLimitForBlockTransactionsByAddress(ctx, address, limit)
	if err != nil {
		uc.logger.Error("failed listing block data by address",
			slog.Any("address", address),
			slog.Any("error", err))
		return nil, err
	}
	if res == nil {
		return nil, nil
	}

	//
	// STEP 3: Apply minor changes.
	//

	for _, tx := range res {
		tx.DataString = string(tx.Data)
		tx.NonceString = tx.GetNonce().String()
		tx.TokenIDString = tx.GetTokenID().String()
		tx.TokenNonceString = tx.GetTokenNonce().String()
	}

	return res[:limit], nil
}

//
