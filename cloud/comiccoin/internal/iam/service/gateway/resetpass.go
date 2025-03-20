package gateway

import (
	"fmt"
	"log/slog"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config/constants"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/jwt"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/password"
	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/securestring"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/storage/database/mongodbcache"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/usecase/user"
)

type GatewayResetPasswordService interface {
	Execute(sessCtx mongo.SessionContext, req *GatewayResetPasswordRequestIDO) (*GatewayResetPasswordResponseIDO, error)
}

type gatewayResetPasswordServiceImpl struct {
	logger                *slog.Logger
	passwordProvider      password.Provider
	cache                 mongodbcache.Cacher
	jwtProvider           jwt.Provider
	userGetByEmailUseCase uc_user.UserGetByEmailUseCase
	userUpdateUseCase     uc_user.UserUpdateUseCase
}

func NewGatewayResetPasswordService(
	logger *slog.Logger,
	pp password.Provider,
	cach mongodbcache.Cacher,
	jwtp jwt.Provider,
	uc1 uc_user.UserGetByEmailUseCase,
	uc2 uc_user.UserUpdateUseCase,
) GatewayResetPasswordService {
	return &gatewayResetPasswordServiceImpl{logger, pp, cach, jwtp, uc1, uc2}
}

type GatewayResetPasswordRequestIDO struct {
	Code            string `json:"code"`
	Email           string `json:"email"`
	Password        string `json:"password"`
	PasswordConfirm string `json:"password_confirm"`
}

type GatewayResetPasswordResponseIDO struct {
	Message string `json:"message"`
}

func (s *gatewayResetPasswordServiceImpl) Execute(sessCtx mongo.SessionContext, req *GatewayResetPasswordRequestIDO) (*GatewayResetPasswordResponseIDO, error) {
	ipAddress, _ := sessCtx.Value(constants.SessionIPAddress).(string)

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
	if len(req.Email) > 255 {
		e["email"] = "too long"
	}
	if req.Password == "" {
		e["password"] = "missing value"
	}
	if req.PasswordConfirm == "" {
		e["password_confirm"] = "missing value"
	}
	if req.PasswordConfirm != req.Password {
		e["password"] = "does not match"
		e["password_confirm"] = "does not match"
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

	if req.Code != u.PasswordResetVerificationCode {
		s.logger.Warn("verification code is incorrect")
		return nil, httperror.NewForBadRequestWithSingleField("code", "Verification code is incorrect")

	}
	if time.Now().After(u.PasswordResetVerificationExpiry) {
		s.logger.Warn("verification code expired")
		return nil, httperror.NewForBadRequestWithSingleField("code", "Verification code has expired")
	}

	//
	// STEP 4: Hash the password and update the user's password in the database.
	//

	password, err := sstring.NewSecureString(req.Password)
	if err != nil {
		s.logger.Error("password securing error", slog.Any("err", err))
		return nil, err
	}

	passwordHash, err := s.passwordProvider.GenerateHashFromPassword(password)
	if err != nil {
		s.logger.Error("hashing error", slog.Any("error", err))
		return nil, err
	}

	u.PasswordHash = passwordHash
	u.PasswordHashAlgorithm = s.passwordProvider.AlgorithmName()
	u.PasswordResetVerificationCode = ""
	u.PasswordResetVerificationExpiry = time.Time{} // This is equivalent to not-set time
	u.ModifiedAt = time.Now()
	u.ModifiedByName = fmt.Sprintf("%s %s", u.FirstName, u.LastName)
	u.ModifiedFromIPAddress = ipAddress
	err = s.userUpdateUseCase.Execute(sessCtx, u)
	if err != nil {
		s.logger.Error("database update error", slog.Any("error", err))
		return nil, err
	}

	//
	// STEP 5: Done
	//

	// Return our auth keys.
	return &GatewayResetPasswordResponseIDO{
		Message: "Password reset email has been sent",
	}, nil
}
