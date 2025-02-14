package blockdata

import (
	"context"
	"log/slog"
	"math/big"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/domain"
)

type GetLatestTokenIDUseCase interface {
	ExecuteByChainID(ctx context.Context, chainID uint16) (*big.Int, error)
}

type getLatestTokenIDUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   domain.BlockDataRepository
}

func NewGetLatestTokenIDUseCase(config *config.Configuration, logger *slog.Logger, repo domain.BlockDataRepository) GetLatestTokenIDUseCase {
	return &getLatestTokenIDUseCaseImpl{config, logger, repo}
}

func (uc *getLatestTokenIDUseCaseImpl) ExecuteByChainID(ctx context.Context, chainID uint16) (*big.Int, error) {
	tokID, err := uc.repo.GetLatestTokenIDByChainID(ctx, chainID)
	if err != nil {
		uc.logger.Error("failed listing all block data", slog.Any("error", err))
		return nil, err
	}
	return tokID, nil
}
