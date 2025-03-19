package gateway

import (
	"fmt"
	"log/slog"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/random"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/jwt"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/password"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/storage/database/mongodbcache"
	uc_emailer "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/usecase/emailer"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/usecase/user"
)

type GatewayForgotPasswordService interface {
	Execute(sessCtx mongo.SessionContext, req *GatewayForgotPasswordRequestIDO) (*GatewayForgotPasswordResponseIDO, error)
}

type gatewayForgotPasswordServiceImpl struct {
	logger                           *slog.Logger
	passwordProvider                 password.Provider
	cache                            mongodbcache.Cacher
	jwtProvider                      jwt.Provider
	userGetByEmailUseCase            uc_user.UserGetByEmailUseCase
	userUpdateUseCase                uc_user.UserUpdateUseCase
	sendUserVerificationEmailUseCase uc_emailer.SendUserVerificationEmailUseCase
}

func NewGatewayForgotPasswordService(
	logger *slog.Logger,
	pp password.Provider,
	cach mongodbcache.Cacher,
	jwtp jwt.Provider,
	uc1 uc_user.UserGetByEmailUseCase,
	uc2 uc_user.UserUpdateUseCase,
	uc3 uc_emailer.SendUserVerificationEmailUseCase,
) GatewayForgotPasswordService {
	return &gatewayForgotPasswordServiceImpl{logger, pp, cach, jwtp, uc1, uc2, uc3}
}

type GatewayForgotPasswordRequestIDO struct {
	Email string `json:"email"`
}

type GatewayForgotPasswordResponseIDO struct {
	Message string `json:"message"`
}

func (s *gatewayForgotPasswordServiceImpl) Execute(sessCtx mongo.SessionContext, req *GatewayForgotPasswordRequestIDO) (*GatewayForgotPasswordResponseIDO, error) {
	//
	// STEP 1: Sanization of input.
	//

	// Defensive Code: For security purposes we need to perform some sanitization on the inputs.
	req.Email = strings.ToLower(req.Email)
	req.Email = strings.ReplaceAll(req.Email, " ", "")
	req.Email = strings.ReplaceAll(req.Email, "\t", "")
	req.Email = strings.TrimSpace(req.Email)

	//
	// STEP 2: Validation of input.
	//

	e := make(map[string]string)
	if req.Email == "" {
		e["email"] = "Email address is required"
	}

	if len(e) != 0 {
		s.logger.Warn("Failed validation login",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 3:
	//

	// Lookup the user in our database, else return a `400 Bad Request` error.
	u, err := s.userGetByEmailUseCase.Execute(sessCtx, req.Email)
	if err != nil {
		s.logger.Error("database error", slog.Any("err", err))
		return nil, err
	}
	if u == nil {
		s.logger.Warn("user does not exist validation error")
		return nil, httperror.NewForBadRequestWithSingleField("email", "Email address does not exist")
	}

	//
	// STEP 4:
	//

	emailVerificationCode, err := random.GenerateSixDigitCode()
	if err != nil {
		s.logger.Error("generating email verification code error", slog.Any("error", err))
		return nil, err
	}

	u.EmailVerificationCode = fmt.Sprintf("%s", emailVerificationCode)
	u.EmailVerificationExpiry = time.Now().Add(5 * time.Minute)
	u.ModifiedAt = time.Now()
	u.ModifiedByName = u.Name
	err = s.userUpdateUseCase.Execute(sessCtx, u)
	if err != nil {
		s.logger.Error("database update error", slog.Any("error", err))
		return nil, err
	}

	//
	// STEP 5: Send email
	//

	if err := s.sendUserVerificationEmailUseCase.Execute(sessCtx, u); err != nil {
		s.logger.Error("failed sending verification email with error", slog.Any("err", err))
		// Skip any error handling...
	}

	//
	// STEP X: Done
	//

	// Return our auth keys.
	return &GatewayForgotPasswordResponseIDO{
		Message: "Password reset email has been sent",
	}, nil
}
