package comicsubmission

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/domain"
)

type ComicSubmissionCountCoinsRewardByFilterUseCase interface {
	Execute(ctx context.Context, filter *domain.ComicSubmissionFilter) (uint64, error)
}

type comicSubmissionCountCoinsRewardByFilterUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   domain.ComicSubmissionRepository
}

func NewComicSubmissionCountCoinsRewardByFilterUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo domain.ComicSubmissionRepository,
) ComicSubmissionCountCoinsRewardByFilterUseCase {
	return &comicSubmissionCountCoinsRewardByFilterUseCaseImpl{config, logger, repo}
}

func (uc *comicSubmissionCountCoinsRewardByFilterUseCaseImpl) Execute(ctx context.Context, filter *domain.ComicSubmissionFilter) (uint64, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if filter == nil {
		e["filter"] = "Comic submission is required"
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed validating",
			slog.Any("error", e))
		return 0, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Count in database.
	//

	return uc.repo.CountCoinsRewardByFilter(ctx, filter)
}
