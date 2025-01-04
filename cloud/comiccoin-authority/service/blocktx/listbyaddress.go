package blocktx

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"
	uc_blocktx "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/blocktx"
	"github.com/ethereum/go-ethereum/common"
)

type ListBlockTransactionsByAddressService struct {
	config                                *config.Configuration
	logger                                *slog.Logger
	listBlockTransactionsByAddressUseCase *uc_blocktx.ListBlockTransactionsByAddressUseCase
}

func NewListBlockTransactionsByAddressService(
	cfg *config.Configuration,
	logger *slog.Logger,
	uc *uc_blocktx.ListBlockTransactionsByAddressUseCase,
) *ListBlockTransactionsByAddressService {
	return &ListBlockTransactionsByAddressService{cfg, logger, uc}
}

func (s *ListBlockTransactionsByAddressService) Execute(ctx context.Context, address *common.Address) ([]*domain.BlockTransaction, error) {
	data, err := s.listBlockTransactionsByAddressUseCase.Execute(ctx, address)
	if err != nil {
		s.logger.Error("Failed listing block transactions by address",
			slog.Any("address", address),
			slog.Any("error", err))
		return nil, err
	}
	if data == nil {
		err := fmt.Errorf("Block transactions data does not exist for address: %v", address)
		s.logger.Error("Failed getting black transaction data",
			slog.Any("address", address),
			slog.Any("error", err))
		return nil, err
	}
	return data, nil
}
