package comicsubmission

import (
	"log/slog"

	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/domain"
	uc_cloudstorage "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/cloudstorage"
	uc_comicsubmission "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/comicsubmission"
)

type ComicSubmissionListByFilterService interface {
	Execute(sessCtx mongo.SessionContext, filter *ComicSubmissionFilterRequestID) (*ComicSubmissionFilterResultResponseIDO, error)
}

type comicSubmissionListByFilterServiceImpl struct {
	logger                             *slog.Logger
	cloudStoragePresignedURLUseCase    uc_cloudstorage.CloudStoragePresignedURLUseCase
	comicSubmissionListByFilterUseCase uc_comicsubmission.ComicSubmissionListByFilterUseCase
}

func NewComicSubmissionListByFilterService(
	logger *slog.Logger,
	uc1 uc_cloudstorage.CloudStoragePresignedURLUseCase,
	uc2 uc_comicsubmission.ComicSubmissionListByFilterUseCase,
) ComicSubmissionListByFilterService {
	return &comicSubmissionListByFilterServiceImpl{logger, uc1, uc2}
}

type ComicSubmissionFilterRequestID domain.ComicSubmissionFilter

type ComicSubmissionFilterResultResponseIDO domain.ComicSubmissionFilterResult

func (s *comicSubmissionListByFilterServiceImpl) Execute(sessCtx mongo.SessionContext, filter *ComicSubmissionFilterRequestID) (*ComicSubmissionFilterResultResponseIDO, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if filter == nil {
		e["filter"] = "UserID is required"
	}
	if len(e) != 0 {
		s.logger.Warn("Failed validating",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Count in database.
	//

	filter2 := (*domain.ComicSubmissionFilter)(filter)

	// Lookup the user in our database, else return a `400 Bad Request` error.
	listResp, err := s.comicSubmissionListByFilterUseCase.Execute(sessCtx, filter2)
	if err != nil {
		s.logger.Error("database error",
			slog.Any("err", err))
		return nil, err
	}

	for _, submission := range listResp.Submissions {
		// Front cover.
		frontPresignedURL, err := s.cloudStoragePresignedURLUseCase.Execute(sessCtx, submission.FrontCover.ObjectKey)
		if err != nil {
			s.logger.Error("Failed generating presigned url via cloud storage", slog.Any("err", err))
			return nil, err
		}
		submission.FrontCover.ObjectURL = frontPresignedURL

		// Back cover.
		backPresignedURL, err := s.cloudStoragePresignedURLUseCase.Execute(sessCtx, submission.BackCover.ObjectKey)
		if err != nil {
			s.logger.Error("Failed generating presigned url via cloud storage", slog.Any("err", err))
			return nil, err
		}
		submission.BackCover.ObjectURL = backPresignedURL
	}

	// s.logger.Debug("fetched",
	// 	slog.Any("id", id),
	// 	slog.Any("detail", detail))

	return (*ComicSubmissionFilterResultResponseIDO)(listResp), nil
}
