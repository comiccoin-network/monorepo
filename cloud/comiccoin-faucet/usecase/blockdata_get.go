package usecase

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/domain"
)

//
// Copied from `github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase`
//

type GetBlockDataUseCase struct {
	config *config.Configuration
	logger *slog.Logger
	repo   domain.BlockDataRepository
}

func NewGetBlockDataUseCase(config *config.Configuration, logger *slog.Logger, repo domain.BlockDataRepository) *GetBlockDataUseCase {
	return &GetBlockDataUseCase{config, logger, repo}
}

func (uc *GetBlockDataUseCase) Execute(ctx context.Context, hash string) (*domain.BlockData, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if hash == "" {
		e["hash"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed getting account",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Insert into database.
	//

	return uc.repo.GetByHash(ctx, hash)
}
