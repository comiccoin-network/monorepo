package blocktx

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/domain"
	"github.com/ethereum/go-ethereum/common"
)

type ListOwnedTokenBlockTransactionsByAddressUseCase interface {
	Execute(ctx context.Context, address *common.Address) ([]*domain.BlockTransaction, error)
}

type listOwnedTokenBlockTransactionsByAddressUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   domain.BlockDataRepository
}

func NewListOwnedTokenBlockTransactionsByAddressUseCase(config *config.Configuration, logger *slog.Logger, repo domain.BlockDataRepository) ListOwnedTokenBlockTransactionsByAddressUseCase {
	return &listOwnedTokenBlockTransactionsByAddressUseCaseImpl{config, logger, repo}
}

func (uc *listOwnedTokenBlockTransactionsByAddressUseCaseImpl) Execute(ctx context.Context, address *common.Address) ([]*domain.BlockTransaction, error) {
	data, err := uc.repo.ListOwnedTokenBlockTransactionsByAddress(ctx, address)
	if err != nil {
		uc.logger.Error("failed listing owned token block transactions by address",
			slog.Any("error", err))
		return nil, err
	}
	return data, nil
}
