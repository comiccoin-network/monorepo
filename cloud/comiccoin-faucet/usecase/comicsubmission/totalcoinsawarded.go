package comicsubmission

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/domain"
)

type ComicSubmissionTotalCoinsAwardedUseCase interface {
	Execute(ctx context.Context) (uint64, error)
}

type comicSubmissionTotalCoinsAwardedUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   domain.ComicSubmissionRepository
}

func NewComicSubmissionTotalCoinsAwardedUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo domain.ComicSubmissionRepository,
) ComicSubmissionTotalCoinsAwardedUseCase {
	return &comicSubmissionTotalCoinsAwardedUseCaseImpl{config, logger, repo}
}

func (uc *comicSubmissionTotalCoinsAwardedUseCaseImpl) Execute(ctx context.Context) (uint64, error) {
	return uc.repo.TotalCoinsAwarded(ctx)
}
