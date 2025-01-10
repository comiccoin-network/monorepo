package user

import (
	"log/slog"

	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/domain"
	uc_cloudstorage "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/cloudstorage"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/user"
)

type UserListByFilterService interface {
	Execute(sessCtx mongo.SessionContext, filter *UserFilterRequestID) (*UserFilterResultResponseIDO, error)
}

type userListByFilterServiceImpl struct {
	logger                             *slog.Logger
	cloudStoragePresignedURLUseCase    uc_cloudstorage.CloudStoragePresignedURLUseCase
	comicSubmissionListByFilterUseCase uc_user.UserListByFilterUseCase
}

func NewUserListByFilterService(
	logger *slog.Logger,
	uc1 uc_cloudstorage.CloudStoragePresignedURLUseCase,
	uc2 uc_user.UserListByFilterUseCase,
) UserListByFilterService {
	return &userListByFilterServiceImpl{logger, uc1, uc2}
}

type UserFilterRequestID domain.UserFilter

type UserFilterResultResponseIDO domain.UserFilterResult

func (s *userListByFilterServiceImpl) Execute(sessCtx mongo.SessionContext, filter *UserFilterRequestID) (*UserFilterResultResponseIDO, error) {
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

	filter2 := (*domain.UserFilter)(filter)

	// Lookup the user in our database, else return a `400 Bad Request` error.
	listResp, err := s.comicSubmissionListByFilterUseCase.Execute(sessCtx, filter2)
	if err != nil {
		s.logger.Error("database error",
			slog.Any("err", err))
		return nil, err
	}

	// s.logger.Debug("fetched",
	// 	slog.Any("id", id),
	// 	slog.Any("detail", detail))

	return (*UserFilterResultResponseIDO)(listResp), nil
}
