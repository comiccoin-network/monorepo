package blockdata

import (
	"context"
	"log/slog"
	"strings"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"

	uc_blockdata "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/usecase/blockdata"
)

type BlockDataGetByHashService interface {
	Execute(ctx context.Context, hash string) (*domain.BlockData, error)
}

type blockDataGetByHashServiceImpl struct {
	logger              *slog.Logger
	GetBlockDataUseCase uc_blockdata.GetBlockDataUseCase
}

func NewBlockDataGetByHashService(
	logger *slog.Logger,
	uc1 uc_blockdata.GetBlockDataUseCase,
) BlockDataGetByHashService {
	return &blockDataGetByHashServiceImpl{logger, uc1}
}

func (s *blockDataGetByHashServiceImpl) Execute(ctx context.Context, hash string) (*domain.BlockData, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if hash == "" {
		e["hash"] = "missing value"
	}
	if len(e) != 0 {
		s.logger.Warn("Failed validating",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Get
	//

	blockData, err := s.GetBlockDataUseCase.ExecuteByHash(ctx, hash)
	if err != nil {
		if !strings.Contains(err.Error(), "does not exist") {
			s.logger.Error("failed getting block data",
				slog.Any("hash", hash),
				slog.Any("error", err))
			return nil, err
		}
	}
	if blockData != nil {
		return blockData, nil
	}

	return nil, nil
}
