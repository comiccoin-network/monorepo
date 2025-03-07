package gateway

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	uc_emailer "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/usecase/emailer"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/usecase/user"
)

type GatewaySendVerifyEmailService interface {
	Execute(sessCtx mongo.SessionContext, req *GatewaySendVerifyEmailRequestIDO) error
}

type gatewaySendVerifyEmailServiceImpl struct {
	logger                           *slog.Logger
	userGetByEmailUseCase            uc_user.UserGetByEmailUseCase
	sendUserVerificationEmailUseCase uc_emailer.SendUserVerificationEmailUseCase
}

func NewGatewaySendVerifyEmailService(
	logger *slog.Logger,
	uc1 uc_user.UserGetByEmailUseCase,
	uc2 uc_emailer.SendUserVerificationEmailUseCase,
) GatewaySendVerifyEmailService {
	return &gatewaySendVerifyEmailServiceImpl{logger, uc1, uc2}
}

type GatewaySendVerifyEmailRequestIDO struct {
	Email string `json:"email"`
}

func (s *gatewaySendVerifyEmailServiceImpl) Execute(sessCtx mongo.SessionContext, req *GatewaySendVerifyEmailRequestIDO) error {
	// Extract from our session the following data.
	// sessionID := sessCtx.Value(constants.SessionID).(string)

	// Lookup the user in our database, else return a `400 Bad Request` error.
	u, err := s.userGetByEmailUseCase.Execute(sessCtx, req.Email)
	if err != nil {
		s.logger.Error("database error", slog.Any("err", err))
		return err
	}
	if u == nil {
		s.logger.Warn("user does not exist for email error")
		return httperror.NewForBadRequestWithSingleField("email", "does not exist")
	}

	if err := s.sendUserVerificationEmailUseCase.Execute(context.Background(), u); err != nil {
		s.logger.Error("failed sending verification email with error", slog.Any("err", err))
		// Skip any error handling...
	}

	return nil
}
