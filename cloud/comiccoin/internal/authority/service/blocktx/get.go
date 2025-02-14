package blocktx

import (
	"context"
	"fmt"
	"log/slog"
	"math/big"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/domain"
	uc_blocktx "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/blocktx"
)

type GetBlockTransactionService interface {
	ExecuteByNonce(ctx context.Context, txNonce *big.Int) (*domain.BlockTransaction, error)
}

type getBlockTransactionServiceImpl struct {
	config                     *config.Configuration
	logger                     *slog.Logger
	GetBlockTransactionUseCase uc_blocktx.GetBlockTransactionUseCase
}

func NewGetBlockTransactionService(
	cfg *config.Configuration,
	logger *slog.Logger,
	uc uc_blocktx.GetBlockTransactionUseCase,
) GetBlockTransactionService {
	return &getBlockTransactionServiceImpl{cfg, logger, uc}
}

func (s *getBlockTransactionServiceImpl) ExecuteByNonce(ctx context.Context, txNonce *big.Int) (*domain.BlockTransaction, error) {
	data, err := s.GetBlockTransactionUseCase.ExecuteByNonce(ctx, txNonce)
	if err != nil {
		s.logger.Error("Failed getting block tx by nonce",
			slog.Any("txNonce", txNonce),
			slog.Any("error", err))
		return nil, err
	}
	if data == nil {
		errStr := fmt.Sprintf("Block data does not exist for transaction nonce: %v", txNonce.String())
		s.logger.Error("Failed getting block data",
			slog.Any("txNonce", txNonce),
			slog.Any("error", errStr))
		return nil, httperror.NewForNotFoundWithSingleField("hash", errStr)
	}
	return data, nil
}
