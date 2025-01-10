package comicsubmission

import (
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/httperror"
	uc_comicsubmission "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/comicsubmission"
)

type ComicSubmissionCountTotalCreatedTodayByUserService interface {
	Execute(sessCtx mongo.SessionContext, userID primitive.ObjectID, userTimezone string) (*ComicSubmissionCountTotalCreatedTodayByUserServiceResponseIDO, error)
}

type comicSubmissionCountTotalCreatedTodayByUserServiceImpl struct {
	logger                                             *slog.Logger
	comicSubmissionCountTotalCreatedTodayByUserUseCase uc_comicsubmission.ComicSubmissionCountTotalCreatedTodayByUserUseCase
}

func NewComicSubmissionCountTotalCreatedTodayByUserService(
	logger *slog.Logger,
	uc1 uc_comicsubmission.ComicSubmissionCountTotalCreatedTodayByUserUseCase,
) ComicSubmissionCountTotalCreatedTodayByUserService {
	return &comicSubmissionCountTotalCreatedTodayByUserServiceImpl{logger, uc1}
}

type ComicSubmissionCountTotalCreatedTodayByUserServiceResponseIDO struct {
	Count uint64 `bson:"count" json:"count"`
}

func (s *comicSubmissionCountTotalCreatedTodayByUserServiceImpl) Execute(sessCtx mongo.SessionContext, userID primitive.ObjectID, userTimezone string) (*ComicSubmissionCountTotalCreatedTodayByUserServiceResponseIDO, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if userID.IsZero() {
		e["user_id"] = "UserID is required"
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
	count, err := s.comicSubmissionCountTotalCreatedTodayByUserUseCase.Execute(sessCtx, userID, userTimezone)
	if err != nil {
		s.logger.Error("database error", slog.Any("err", err))
		return nil, err
	}
	return &ComicSubmissionCountTotalCreatedTodayByUserServiceResponseIDO{Count: count}, nil
}
