package gateway

import (
	"encoding/json"
	"log/slog"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/jwt"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/password"
	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/securestring"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/storage/database/mongodbcache"
	domain "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/domain/user"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/usecase/user"
)

type GatewayLoginService interface {
	Execute(sessCtx mongo.SessionContext, req *GatewayLoginRequestIDO) (*GatewayLoginResponseIDO, error)
}

type gatewayLoginServiceImpl struct {
	logger                *slog.Logger
	passwordProvider      password.Provider
	cache                 mongodbcache.Cacher
	jwtProvider           jwt.Provider
	userGetByEmailUseCase uc_user.UserGetByEmailUseCase
	userUpdateUseCase     uc_user.UserUpdateUseCase
}

func NewGatewayLoginService(
	logger *slog.Logger,
	pp password.Provider,
	cach mongodbcache.Cacher,
	jwtp jwt.Provider,
	uc1 uc_user.UserGetByEmailUseCase,
	uc2 uc_user.UserUpdateUseCase,
) GatewayLoginService {
	return &gatewayLoginServiceImpl{logger, pp, cach, jwtp, uc1, uc2}
}

type GatewayLoginRequestIDO struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type GatewayLoginResponseIDO struct {
	User                   *domain.User `json:"user"`
	AccessToken            string       `json:"access_token"`
	AccessTokenExpiryTime  time.Time    `json:"access_token_expiry_time"`
	RefreshToken           string       `json:"refresh_token"`
	RefreshTokenExpiryTime time.Time    `json:"refresh_token_expiry_time"`
}

func (s *gatewayLoginServiceImpl) Execute(sessCtx mongo.SessionContext, req *GatewayLoginRequestIDO) (*GatewayLoginResponseIDO, error) {
	//
	// STEP 1: Sanization of input.
	//

	// Defensive Code: For security purposes we need to perform some sanitization on the inputs.
	req.Email = strings.ToLower(req.Email)
	req.Email = strings.ReplaceAll(req.Email, " ", "")
	req.Email = strings.ReplaceAll(req.Email, "\t", "")
	req.Email = strings.TrimSpace(req.Email)
	req.Password = strings.ReplaceAll(req.Password, " ", "")
	req.Password = strings.ReplaceAll(req.Password, "\t", "")
	req.Password = strings.TrimSpace(req.Password)

	//
	// STEP 2: Validation of input.
	//

	e := make(map[string]string)
	if req.Email == "" {
		e["email"] = "Email address is required"
	}
	if req.Password == "" {
		e["password"] = "Password is required"
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

	securePassword, err := sstring.NewSecureString(req.Password)
	if err != nil {
		s.logger.Error("database error", slog.Any("err", err))
		return nil, err
	}

	// Verify the inputted password and hashed password match.
	passwordMatch, _ := s.passwordProvider.ComparePasswordAndHash(securePassword, u.PasswordHash)
	if passwordMatch == false {
		s.logger.Warn("password check validation error")
		return nil, httperror.NewForBadRequestWithSingleField("password", "Password does not match with record")
	}

	// Enforce the verification code of the email.
	if u.WasEmailVerified == false {
		s.logger.Warn("email verification validation error", slog.Any("u", u))
		return nil, httperror.NewForBadRequestWithSingleField("email", "Email address was not verified")
	}

	// // Enforce 2FA if enabled.
	if u.OTPEnabled {
		// We need to reset the `otp_validated` status to be false to force
		// the user to use their `totp authenticator` application.
		u.OTPValidated = false
		u.ModifiedAt = time.Now()
		if err := s.userUpdateUseCase.Execute(sessCtx, u); err != nil {
			s.logger.Error("failed updating user during login",
				slog.Any("err", err))
			return nil, err
		}
	}

	return s.loginWithUser(sessCtx, u)
}

func (s *gatewayLoginServiceImpl) loginWithUser(sessCtx mongo.SessionContext, u *domain.User) (*GatewayLoginResponseIDO, error) {
	uBin, err := json.Marshal(u)
	if err != nil {
		s.logger.Error("marshalling error", slog.Any("err", err))
		return nil, err
	}

	// Set expiry duration.
	atExpiry := 24 * time.Hour
	rtExpiry := 14 * 24 * time.Hour

	// Start our session using an access and refresh token.
	sessionUUID := primitive.NewObjectID().Hex()

	err = s.cache.SetWithExpiry(sessCtx, sessionUUID, uBin, rtExpiry)
	if err != nil {
		s.logger.Error("cache set with expiry error", slog.Any("err", err))
		return nil, err
	}

	// Generate our JWT token.
	accessToken, accessTokenExpiry, refreshToken, refreshTokenExpiry, err := s.jwtProvider.GenerateJWTTokenPair(sessionUUID, atExpiry, rtExpiry)
	if err != nil {
		s.logger.Error("jwt generate pairs error", slog.Any("err", err))
		return nil, err
	}

	// For debugging purposes we want to print the wallet address.
	s.logger.Debug("login successfull",
		slog.Any("wallet_address", u.WalletAddress))

	// Return our auth keys.
	return &GatewayLoginResponseIDO{
		User:                   u,
		AccessToken:            accessToken,
		AccessTokenExpiryTime:  accessTokenExpiry,
		RefreshToken:           refreshToken,
		RefreshTokenExpiryTime: refreshTokenExpiry,
	}, nil
}
