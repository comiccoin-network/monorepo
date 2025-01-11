package blockdata

import (
	"context"
	"log/slog"
	"strings"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"

	uc_blockdata "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/usecase/blockdata"
)

type GetByBlockTransactionTimestampService interface {
	Execute(ctx context.Context, timestamp uint64) (*domain.BlockData, error)
}

type getByBlockTransactionTimestampServiceImpl struct {
	logger                                *slog.Logger
	GetByBlockTransactionTimestampUseCase uc_blockdata.GetByBlockTransactionTimestampUseCase
}

func NewGetByBlockTransactionTimestampService(
	logger *slog.Logger,
	uc1 uc_blockdata.GetByBlockTransactionTimestampUseCase,
) GetByBlockTransactionTimestampService {
	return &getByBlockTransactionTimestampServiceImpl{logger, uc1}
}

func (s *getByBlockTransactionTimestampServiceImpl) Execute(ctx context.Context, timestamp uint64) (*domain.BlockData, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if timestamp == 0 {
		e["timestamp"] = "missing value"
	}
	if len(e) != 0 {
		s.logger.Warn("Failed validating",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Get
	//

	blockData, err := s.GetByBlockTransactionTimestampUseCase.Execute(ctx, timestamp)
	if err != nil {
		if !strings.Contains(err.Error(), "does not exist") {
			s.logger.Error("failed getting block data",
				slog.Any("timestamp", timestamp),
				slog.Any("error", err))
			return nil, err
		}
	}
	if blockData != nil {
		return blockData, nil
	}

	return nil, nil
}
