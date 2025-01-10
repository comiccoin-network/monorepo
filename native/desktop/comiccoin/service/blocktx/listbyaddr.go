package blocktx

import (
	"context"
	"log/slog"

	"github.com/ethereum/go-ethereum/common"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"

	uc_blocktx "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/usecase/blocktx"
)

type ListBlockTransactionsByAddressService struct {
	logger                                *slog.Logger
	listBlockTransactionsByAddressUseCase uc_blocktx.ListBlockTransactionsByAddressUseCase
}

func NewListBlockTransactionsByAddressService(
	logger *slog.Logger,
	uc1 uc_blocktx.ListBlockTransactionsByAddressUseCase,
) *ListBlockTransactionsByAddressService {
	return &ListBlockTransactionsByAddressService{logger, uc1}
}

func (s *ListBlockTransactionsByAddressService) Execute(ctx context.Context, address *common.Address) ([]*domain.BlockTransaction, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if address == nil {
		e["address"] = "missing value"
	}
	if len(e) != 0 {
		s.logger.Warn("Failed validating",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: List the tokens by owner.
	//

	return s.listBlockTransactionsByAddressUseCase.Execute(ctx, address)
}
