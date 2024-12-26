package service

import (
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/kmutexutil"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/security/password"
	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/security/securestring"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/config/constants"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase"
)

type GatewayResetPasswordService struct {
	logger                           *slog.Logger
	kmutex                           kmutexutil.KMutexProvider
	passwordProvider                 password.Provider
	userGetByVerificationCodeUseCase *usecase.UserGetByVerificationCodeUseCase
	userUpdateUseCase                *usecase.UserUpdateUseCase
}

func NewGatewayResetPasswordService(
	logger *slog.Logger,
	kmutex kmutexutil.KMutexProvider,
	pp password.Provider,
	uc1 *usecase.UserGetByVerificationCodeUseCase,
	uc2 *usecase.UserUpdateUseCase,
) *GatewayResetPasswordService {
	return &GatewayResetPasswordService{logger, kmutex, pp, uc1, uc2}
}

type GatewayResetPasswordRequestIDO struct {
	Code     string `json:"code"`
	Password string `json:"password"`
}

func (s *GatewayResetPasswordService) Execute(sessCtx mongo.SessionContext, req *GatewayResetPasswordRequestIDO) error {
	s.kmutex.Acquire(req.Code)
	defer func() {
		s.kmutex.Release(req.Code)
	}()

	// // Extract from our session the following data.
	// sessionID := sessCtx.Value(constants.SessionID).(string)

	// Lookup the user in our database, else return a `400 Bad Request` error.
	u, err := s.userGetByVerificationCodeUseCase.Execute(sessCtx, req.Code)
	if err != nil {
		s.logger.Error("database error", slog.Any("err", err))
		return err
	}
	if u == nil {
		s.logger.Warn("user does not exist validation error")
		return httperror.NewForBadRequestWithSingleField("code", "does not exist")
	}

	//TODO: Handle expiry dates.

	securePassword, err := sstring.NewSecureString(req.Password)
	if err != nil {
		s.logger.Error("database error", slog.Any("err", err))
		return err
	}

	passwordHash, err := s.passwordProvider.GenerateHashFromPassword(securePassword)
	if err != nil {
		s.logger.Error("hashing error", slog.Any("error", err))
		return err
	}

	// Extract from our session the following data.
	ipAddress, _ := sessCtx.Value(constants.SessionIPAddress).(string)

	// Verify the user.
	u.PasswordHash = passwordHash
	u.PasswordHashAlgorithm = s.passwordProvider.AlgorithmName()
	u.EmailVerificationCode = "" // Remove email active code so it cannot be used agian.
	u.EmailVerificationExpiry = time.Now()
	u.ModifiedAt = time.Now()
	// u.ModifiedByUserID = userID
	// u.ModifiedByName = fmt.Sprintf("%s %s", u.FirstName, u.LastName)
	u.ModifiedFromIPAddress = ipAddress
	if err := s.userUpdateUseCase.Execute(sessCtx, u); err != nil {
		s.logger.Error("update error", slog.Any("err", err))
		return err
	}

	return nil
}
