package gateway

import (
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config/constants"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	domain "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/user"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/usecase/user"
)

type GatewayVerifyEmailService interface {
	Execute(sessCtx mongo.SessionContext, req *GatewayVerifyEmailRequestIDO) (*GatwayVerifyEmailResponseIDO, error)
}

type gatewayVerifyEmailServiceImpl struct {
	logger                           *slog.Logger
	userGetByVerificationCodeUseCase uc_user.UserGetByVerificationCodeUseCase
	userUpdateUseCase                uc_user.UserUpdateUseCase
}

func NewGatewayVerifyEmailService(
	logger *slog.Logger,
	uc1 uc_user.UserGetByVerificationCodeUseCase,
	uc2 uc_user.UserUpdateUseCase,
) GatewayVerifyEmailService {
	return &gatewayVerifyEmailServiceImpl{logger, uc1, uc2}
}

type GatewayVerifyEmailRequestIDO struct {
	Code string `json:"code"`
}

type GatwayVerifyEmailResponseIDO struct {
	Message  string `json:"message"`
	UserRole int8   `bson:"user_role" json:"user_role"`
}

func (s *gatewayVerifyEmailServiceImpl) Execute(sessCtx mongo.SessionContext, req *GatewayVerifyEmailRequestIDO) (*GatwayVerifyEmailResponseIDO, error) {
	// Extract from our session the following data.
	// sessionID := sessCtx.Value(constants.SessionID).(string)

	res := &GatwayVerifyEmailResponseIDO{}

	// Lookup the user in our database, else return a `400 Bad Request` error.
	u, err := s.userGetByVerificationCodeUseCase.Execute(sessCtx, req.Code)
	if err != nil {
		s.logger.Error("database error", slog.Any("err", err))
		return nil, err
	}
	if u == nil {
		s.logger.Warn("user does not exist validation error")
		return nil, httperror.NewForBadRequestWithSingleField("code", "does not exist")
	}

	//TODO: Handle expiry dates.

	// Extract from our session the following data.
	// userID := sessCtx.Value(constants.SessionUserID).(primitive.ObjectID)
	ipAddress, _ := sessCtx.Value(constants.SessionIPAddress).(string)

	// Verify the user.
	u.WasEmailVerified = true
	// ou.ModifiedByUserID = userID
	u.ModifiedAt = time.Now()
	// ou.ModifiedByName = fmt.Sprintf("%s %s", ou.FirstName, ou.LastName)
	u.ModifiedFromIPAddress = ipAddress
	if err := s.userUpdateUseCase.Execute(sessCtx, u); err != nil {
		s.logger.Error("update error", slog.Any("err", err))
		return nil, err
	}

	//
	// Send notification based on user role
	//

	switch u.Role {
	case domain.UserRoleIndividual:
		{
			res.Message = "Thank you for verifying. You may log in now to get started!"
			s.logger.Debug("customer user verified")
			break
		}
	default:
		{
			res.Message = "Thank you for verifying. You may log in now to get started!"
			s.logger.Debug("unknown user verified")
			break
		}
	}
	res.UserRole = u.Role

	return res, nil
}
