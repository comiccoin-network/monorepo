package blockdata

import (
	"context"
	"fmt"
	"log/slog"
	"math/big"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/domain"
	uc_blockdata "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/blockdata"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
)

type GetBlockDataService interface {
	ExecuteByHash(ctx context.Context, hash string) (*domain.BlockData, error)
	ExecuteByHeaderNumber(ctx context.Context, blockHeader *big.Int) (*domain.BlockData, error)
	ExecuteByTransactionNonce(ctx context.Context, txNonce *big.Int) (*domain.BlockData, error)
}

type getBlockDataServiceImpl struct {
	config              *config.Configuration
	logger              *slog.Logger
	GetBlockDataUseCase uc_blockdata.GetBlockDataUseCase
}

func NewGetBlockDataService(
	cfg *config.Configuration,
	logger *slog.Logger,
	uc uc_blockdata.GetBlockDataUseCase,
) GetBlockDataService {
	return &getBlockDataServiceImpl{cfg, logger, uc}
}

func (s *getBlockDataServiceImpl) ExecuteByHash(ctx context.Context, hash string) (*domain.BlockData, error) {
	data, err := s.GetBlockDataUseCase.ExecuteByHash(ctx, hash)
	if err != nil {
		s.logger.Error("Failed getting block data", slog.Any("error", err))
		return nil, err
	}
	if data == nil {
		errStr := fmt.Sprintf("Block data does not exist for hash: %v", hash)
		s.logger.Error("Failed getting block data", slog.Any("error", errStr))
		return nil, httperror.NewForNotFoundWithSingleField("hash", errStr)
	}
	return data, nil
}

func (s *getBlockDataServiceImpl) ExecuteByHeaderNumber(ctx context.Context, blockHeader *big.Int) (*domain.BlockData, error) {
	data, err := s.GetBlockDataUseCase.ExecuteByHeaderNumber(ctx, blockHeader)
	if err != nil {
		s.logger.Error("Failed getting block data", slog.Any("error", err))
		return nil, err
	}
	if data == nil {
		errStr := fmt.Sprintf("Block data does not exist for block header: %v", blockHeader.String())
		s.logger.Error("Failed getting block data", slog.Any("error", errStr))
		return nil, httperror.NewForNotFoundWithSingleField("hash", errStr)
	}
	return data, nil
}

func (s *getBlockDataServiceImpl) ExecuteByTransactionNonce(ctx context.Context, txNonce *big.Int) (*domain.BlockData, error) {
	data, err := s.GetBlockDataUseCase.ExecuteByTransactionNonce(ctx, txNonce)
	if err != nil {
		s.logger.Error("Failed getting block data", slog.Any("error", err))
		return nil, err
	}
	if data == nil {
		errStr := fmt.Sprintf("Block data does not exist for transaction nonce: %v", txNonce.String())
		s.logger.Error("Failed getting block data", slog.Any("error", errStr))
		return nil, httperror.NewForNotFoundWithSingleField("hash", errStr)
	}
	return data, nil
}
