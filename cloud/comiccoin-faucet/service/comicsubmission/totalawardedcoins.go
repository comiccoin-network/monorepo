package comicsubmission

import (
	"log/slog"

	"go.mongodb.org/mongo-driver/mongo"

	uc_comicsubmission "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/comicsubmission"
)

type ComicSubmissionTotalCoinsAwardedService struct {
	logger                                  *slog.Logger
	comicSubmissionTotalCoinsAwardedUseCase uc_comicsubmission.ComicSubmissionTotalCoinsAwardedUseCase
}

func NewComicSubmissionTotalCoinsAwardedService(
	logger *slog.Logger,
	uc1 uc_comicsubmission.ComicSubmissionTotalCoinsAwardedUseCase,
) *ComicSubmissionTotalCoinsAwardedService {
	return &ComicSubmissionTotalCoinsAwardedService{logger, uc1}
}

type ComicSubmissionTotalCoinsAwardedResponseIDO struct {
	Count uint64 `bson:"count" json:"count"`
}

func (s *ComicSubmissionTotalCoinsAwardedService) Execute(sessCtx mongo.SessionContext) (*ComicSubmissionTotalCoinsAwardedResponseIDO, error) {
	count, err := s.comicSubmissionTotalCoinsAwardedUseCase.Execute(sessCtx)
	if err != nil {
		s.logger.Error("database error",
			slog.Any("err", err))
		return nil, err
	}
	return &ComicSubmissionTotalCoinsAwardedResponseIDO{Count: count}, nil
}
