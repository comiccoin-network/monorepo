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

type GetLatestBlockTransactionByAddressService interface {
	Execute(ctx context.Context, address *common.Address) (*domain.BlockTransaction, error)
}

type getLatestBlockTransactionsByAddressServiceImpl struct {
	config                                     *config.Configuration
	logger                                     *slog.Logger
	getLatestBlockTransactionsByAddressUseCase uc_blocktx.GetLatestBlockTransactionsByAddressUseCase
}

func NewGetLatestBlockTransactionByAddressService(
	cfg *config.Configuration,
	logger *slog.Logger,
	uc uc_blocktx.GetLatestBlockTransactionsByAddressUseCase,
) GetLatestBlockTransactionByAddressService {
	return &getLatestBlockTransactionsByAddressServiceImpl{cfg, logger, uc}
}

func (s *getLatestBlockTransactionsByAddressServiceImpl) Execute(ctx context.Context, address *common.Address) (*domain.BlockTransaction, error) {
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
			// Defensive code: We want to restrict getting latest transactions
			// from `coinbase address` b/c we want to only focus on user
			// accounts instead.
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

	data, err := s.getLatestBlockTransactionsByAddressUseCase.Execute(ctx, address)
	if err != nil {
		s.logger.Error("Failed getting latest block transactions by address",
			slog.Any("address", address),
			slog.Any("error", err))
		return nil, err
	}
	return data, nil
}
