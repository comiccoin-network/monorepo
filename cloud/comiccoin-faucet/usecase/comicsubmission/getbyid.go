package comicsubmission

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/domain"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ComicSubmissionGetByIDUseCase interface {
	Execute(ctx context.Context, id primitive.ObjectID) (*domain.ComicSubmission, error)
}

type comicSubmissionGetByIDUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   domain.ComicSubmissionRepository
}

func NewComicSubmissionGetByIDUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo domain.ComicSubmissionRepository,
) ComicSubmissionGetByIDUseCase {
	return &comicSubmissionGetByIDUseCaseImpl{config, logger, repo}
}

func (uc *comicSubmissionGetByIDUseCaseImpl) Execute(ctx context.Context, id primitive.ObjectID) (*domain.ComicSubmission, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if id.IsZero() {
		e["id"] = "Comic submission is required"
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed validating",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Count in database.
	//

	return uc.repo.GetByID(ctx, id)
}
