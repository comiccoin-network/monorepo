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

type ListBlockTransactionsByAddressService interface {
	Execute(ctx context.Context, address *common.Address, filterByType string) ([]*domain.BlockTransaction, error)
}

type listBlockTransactionsByAddressServiceImpl struct {
	config                                *config.Configuration
	logger                                *slog.Logger
	listBlockTransactionsByAddressUseCase uc_blocktx.ListBlockTransactionsByAddressUseCase
}

func NewListBlockTransactionsByAddressService(
	cfg *config.Configuration,
	logger *slog.Logger,
	uc uc_blocktx.ListBlockTransactionsByAddressUseCase,
) ListBlockTransactionsByAddressService {
	return &listBlockTransactionsByAddressServiceImpl{cfg, logger, uc}
}

func (s *listBlockTransactionsByAddressServiceImpl) Execute(ctx context.Context, address *common.Address, filterByType string) ([]*domain.BlockTransaction, error) {
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

	data, err := s.listBlockTransactionsByAddressUseCase.Execute(ctx, address)
	if err != nil {
		s.logger.Error("Failed listing block transactions by address",
			slog.Any("address", address),
			slog.Any("error", err))
		return nil, err
	}
	if data == nil {
		s.logger.Warn("Block transactions list is empty for lookup",
			slog.Any("address", address))
		return []*domain.BlockTransaction{}, nil
	}

	//
	// STEP 3: Apply filter
	//

	if filterByType != "" {
		s.logger.Debug("Filtering block transactions list by type",
			slog.Any("type", filterByType))

		filtered := make([]*domain.BlockTransaction, 0)
		for _, datum := range data {
			if datum.Type == filterByType {
				filtered = append(filtered, datum)
			}
		}
		data = filtered

		s.logger.Debug("Filtered block transactions list by type",
			slog.Any("type", filterByType),
			slog.Any("filtered", filtered))
	}

	return data, nil
}
