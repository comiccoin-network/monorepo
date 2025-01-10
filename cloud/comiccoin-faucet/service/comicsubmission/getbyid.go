package comicsubmission

import (
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/domain"
	uc_comicsubmission "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/comicsubmission"
)

type ComicSubmissionGetService interface {
	Execute(sessCtx mongo.SessionContext, id primitive.ObjectID) (*ComicSubmissionResponseIDO, error)
}

type comicSubmissionGetServiceImpl struct {
	logger                        *slog.Logger
	comicSubmissionGetByIDUseCase uc_comicsubmission.ComicSubmissionGetByIDUseCase
}

func NewComicSubmissionGetService(
	logger *slog.Logger,
	uc1 uc_comicsubmission.ComicSubmissionGetByIDUseCase,
) ComicSubmissionGetService {
	return &comicSubmissionGetServiceImpl{logger, uc1}
}

type ComicSubmissionResponseIDO domain.ComicSubmission

func (s *comicSubmissionGetServiceImpl) Execute(sessCtx mongo.SessionContext, id primitive.ObjectID) (*ComicSubmissionResponseIDO, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if id.IsZero() {
		e["id"] = "UserID is required"
	}
	if len(e) != 0 {
		s.logger.Warn("Failed validating",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Count in database.
	//

	// Lookup the user in our database, else return a `400 Bad Request` error.
	detail, err := s.comicSubmissionGetByIDUseCase.Execute(sessCtx, id)
	if err != nil {
		s.logger.Error("database error",
			slog.Any("err", err))
		return nil, err
	}

	// s.logger.Debug("fetched",
	// 	slog.Any("id", id),
	// 	slog.Any("detail", detail))

	return (*ComicSubmissionResponseIDO)(detail), nil
}
