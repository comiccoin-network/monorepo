package blocktx

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"
	uc_blocktx "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/blocktx"
	"github.com/ethereum/go-ethereum/common"
)

type ListOwnedTokenBlockTransactionsByAddressService interface {
	Execute(ctx context.Context, address *common.Address) ([]*domain.BlockTransaction, error)
}

type listOwnedTokenBlockTransactionsByAddressServiceImpl struct {
	config                                          *config.Configuration
	logger                                          *slog.Logger
	listOwnedTokenBlockTransactionsByAddressUseCase uc_blocktx.ListOwnedTokenBlockTransactionsByAddressUseCase
}

func NewListOwnedTokenBlockTransactionsByAddressService(
	cfg *config.Configuration,
	logger *slog.Logger,
	uc uc_blocktx.ListOwnedTokenBlockTransactionsByAddressUseCase,
) ListOwnedTokenBlockTransactionsByAddressService {
	return &listOwnedTokenBlockTransactionsByAddressServiceImpl{cfg, logger, uc}
}

func (s *listOwnedTokenBlockTransactionsByAddressServiceImpl) Execute(ctx context.Context, address *common.Address) ([]*domain.BlockTransaction, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if address == nil {
		e["address"] = "Address is required"
	} else {
		if address.String() == "" {
			e["address"] = "Address is required"
		} else {
			// Defensive code: We want to restrict getting all the transactions
			// from `coinbase address` b/c it will overload the system.
			if address.String() == s.config.Blockchain.ProofOfAuthorityAccountAddress.String() {
				e["address"] = "Coinbase address lookup is restricted"
			}
		}
	}
	if len(e) != 0 {
		s.logger.Warn("Failed faild",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Fetch from database.
	//

	data, err := s.listOwnedTokenBlockTransactionsByAddressUseCase.Execute(ctx, address)
	if err != nil {
		s.logger.Error("Failed listing owned token block transactions by address",
			slog.Any("address", address),
			slog.Any("error", err))
		return nil, err
	}
	if data == nil {
		s.logger.Warn("Owned token block transactions list is empty for lookup",
			slog.Any("address", address))
		return []*domain.BlockTransaction{}, nil
	}

	return data, nil
}
