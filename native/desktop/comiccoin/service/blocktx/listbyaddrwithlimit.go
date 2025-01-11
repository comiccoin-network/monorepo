package blocktx

import (
	"context"
	"log/slog"

	"github.com/ethereum/go-ethereum/common"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"

	uc_blocktx "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/usecase/blocktx"
)

type ListWithLimitBlockTransactionsByAddressService interface {
	Execute(ctx context.Context, address *common.Address, limit int64) ([]*domain.BlockTransaction, error)
}

type listWithLimitBlockTransactionsByAddressServiceImpl struct {
	logger                                         *slog.Logger
	listWithLimitBlockTransactionsByAddressUseCase uc_blocktx.ListWithLimitBlockTransactionsByAddressUseCase
}

func NewListWithLimitBlockTransactionsByAddressService(
	logger *slog.Logger,
	uc1 uc_blocktx.ListWithLimitBlockTransactionsByAddressUseCase,
) ListWithLimitBlockTransactionsByAddressService {
	return &listWithLimitBlockTransactionsByAddressServiceImpl{logger, uc1}
}

func (s *listWithLimitBlockTransactionsByAddressServiceImpl) Execute(ctx context.Context, address *common.Address, limit int64) ([]*domain.BlockTransaction, error) {
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
		s.logger.Warn("Failed validating",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: List the tokens by owner.
	//

	return s.listWithLimitBlockTransactionsByAddressUseCase.Execute(ctx, address, limit)
}
