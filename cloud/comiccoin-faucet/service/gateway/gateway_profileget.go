package gateway

import (
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/config/constants"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/domain"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/user"
)

type GatewayProfileGetService interface {
	Execute(sessCtx mongo.SessionContext) (*domain.User, error)
}

type gatewayProfileGetServiceImpl struct {
	logger             *slog.Logger
	userGetByIDUseCase uc_user.UserGetByIDUseCase
}

func NewGatewayProfileGetService(
	logger *slog.Logger,
	uc1 uc_user.UserGetByIDUseCase,
) GatewayProfileGetService {
	return &gatewayProfileGetServiceImpl{logger, uc1}
}

func (s *gatewayProfileGetServiceImpl) Execute(sessCtx mongo.SessionContext) (*domain.User, error) {
	// Extract from our session the following data.
	userID := sessCtx.Value(constants.SessionUserID).(primitive.ObjectID)

	// Lookup the user in our database, else return a `400 Bad Request` error.
	u, err := s.userGetByIDUseCase.Execute(sessCtx, userID)
	if err != nil {
		s.logger.Error("database error", slog.Any("err", err))
		return nil, err
	}
	if u == nil {
		s.logger.Warn("user does not exist validation error")
		return nil, httperror.NewForBadRequestWithSingleField("id", "does not exist")
	}
	return u, nil
}
