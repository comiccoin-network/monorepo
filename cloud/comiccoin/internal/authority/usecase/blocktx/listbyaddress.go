package blocktx

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/domain"
	"github.com/ethereum/go-ethereum/common"
)

type ListBlockTransactionsByAddressUseCase interface {
	Execute(ctx context.Context, address *common.Address) ([]*domain.BlockTransaction, error)
}

type listBlockTransactionsByAddressUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   domain.BlockDataRepository
}

func NewListBlockTransactionsByAddressUseCase(config *config.Configuration, logger *slog.Logger, repo domain.BlockDataRepository) ListBlockTransactionsByAddressUseCase {
	return &listBlockTransactionsByAddressUseCaseImpl{config, logger, repo}
}

func (uc *listBlockTransactionsByAddressUseCaseImpl) Execute(ctx context.Context, address *common.Address) ([]*domain.BlockTransaction, error) {
	data, err := uc.repo.ListBlockTransactionsByAddress(ctx, address)
	if err != nil {
		uc.logger.Error("failed listing block transactions by address",
			slog.Any("error", err))
		return nil, err
	}
	return data, nil
}
