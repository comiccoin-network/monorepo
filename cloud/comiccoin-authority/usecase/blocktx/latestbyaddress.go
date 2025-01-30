package blocktx

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"
	"github.com/ethereum/go-ethereum/common"
)

type GetLatestBlockTransactionsByAddressUseCase interface {
	Execute(ctx context.Context, address *common.Address) (*domain.BlockTransaction, error)
}

type getLatestBlockTransactionsByAddressUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   domain.BlockDataRepository
}

func NewGetLatestBlockTransactionsByAddressUseCase(config *config.Configuration, logger *slog.Logger, repo domain.BlockDataRepository) GetLatestBlockTransactionsByAddressUseCase {
	return &getLatestBlockTransactionsByAddressUseCaseImpl{config, logger, repo}
}

func (uc *getLatestBlockTransactionsByAddressUseCaseImpl) Execute(ctx context.Context, address *common.Address) (*domain.BlockTransaction, error) {
	data, err := uc.repo.GetLatestBlockTransactionByAddress(ctx, address)
	if err != nil {
		uc.logger.Error("failed getting latest block transactions by address",
			slog.Any("error", err))
		return nil, err
	}
	return data, nil
}
