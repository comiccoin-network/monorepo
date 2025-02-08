// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/service/login/service.go
package login

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/config"
	dom_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/domain/token"
	uc_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/usecase/oauth"
	uc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/usecase/token"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/usecase/user"
)

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	AppID    string `json:"app_id"`
	AuthFlow string `json:"auth_flow"` // "auto" or "manual"
}

type LoginResponse struct {
	AuthCode      string `json:"auth_code,omitempty"`     // For manual flow
	RedirectURI   string `json:"redirect_uri,omitempty"`  // For manual flow
	AccessToken   string `json:"access_token,omitempty"`  // For auto flow
	RefreshToken  string `json:"refresh_token,omitempty"` // For auto flow
	TokenType     string `json:"token_type,omitempty"`    // For auto flow
	ExpiresIn     int    `json:"expires_in,omitempty"`    // For auto flow
	HasOTPEnabled bool   `json:"has_otp_enabled"`         // 2FA status
	OTPValidated  bool   `json:"otp_validated,omitempty"` // 2FA validation status
}

type LoginService interface {
	ProcessLogin(ctx context.Context, req *LoginRequest) (*LoginResponse, error)
}

type loginServiceImpl struct {
	config                *config.Configuration
	logger                *slog.Logger
	getAuthURLUseCase     uc_oauth.GetAuthorizationURLUseCase
	exchangeCodeUseCase   uc_oauth.ExchangeCodeUseCase
	userGetByEmailUseCase uc_user.UserGetByEmailUseCase
	tokenUpsertUseCase    uc_token.TokenUpsertByUserIDUseCase
}

func NewLoginService(
	config *config.Configuration,
	logger *slog.Logger,
	getAuthURLUseCase uc_oauth.GetAuthorizationURLUseCase,
	exchangeCodeUseCase uc_oauth.ExchangeCodeUseCase,
	userGetByEmailUseCase uc_user.UserGetByEmailUseCase,
	tokenUpsertUseCase uc_token.TokenUpsertByUserIDUseCase,
) LoginService {
	return &loginServiceImpl{
		config:                config,
		logger:                logger,
		getAuthURLUseCase:     getAuthURLUseCase,
		exchangeCodeUseCase:   exchangeCodeUseCase,
		userGetByEmailUseCase: userGetByEmailUseCase,
		tokenUpsertUseCase:    tokenUpsertUseCase,
	}
}

func (s *loginServiceImpl) ProcessLogin(ctx context.Context, req *LoginRequest) (*LoginResponse, error) {
	// First, check if user exists in our database
	user, err := s.userGetByEmailUseCase.Execute(ctx, req.Email)
	if err != nil {
		s.logger.Error("failed to get user",
			slog.String("email", req.Email),
			slog.Any("error", err))
		return nil, err
	}

	// For automatic auth flow
	if req.AuthFlow == "auto" {
		// Get authorization URL with state parameter
		authState := "login:" + user.ID.Hex() // Simple state format, could be more complex
		authURL, err := s.getAuthURLUseCase.Execute(ctx, authState)
		if err != nil {
			s.logger.Error("failed to get authorization URL",
				slog.String("email", req.Email),
				slog.Any("error", err))
			return nil, err
		}

		// Exchange the code for tokens
		tokenResp, err := s.exchangeCodeUseCase.Execute(ctx, authURL)
		if err != nil {
			s.logger.Error("failed to exchange code for tokens",
				slog.String("email", req.Email),
				slog.Any("error", err))
			return nil, err
		}

		// Store the tokens
		token := &dom_token.Token{
			UserID:       user.ID,
			AccessToken:  tokenResp.AccessToken,
			RefreshToken: tokenResp.RefreshToken,
			ExpiresAt:    tokenResp.ExpiresAt,
		}

		err = s.tokenUpsertUseCase.Execute(ctx, token)
		if err != nil {
			s.logger.Error("failed to store tokens",
				slog.String("email", req.Email),
				slog.Any("error", err))
			return nil, err
		}

		return &LoginResponse{
			AccessToken:   tokenResp.AccessToken,
			RefreshToken:  tokenResp.RefreshToken,
			TokenType:     tokenResp.TokenType,
			ExpiresIn:     tokenResp.ExpiresIn,
			HasOTPEnabled: user.OTPEnabled,
			OTPValidated:  user.OTPValidated,
		}, nil
	}

	// For manual auth flow
	authState := "login:" + user.ID.Hex()
	authURL, err := s.getAuthURLUseCase.Execute(ctx, authState)
	if err != nil {
		s.logger.Error("failed to get authorization URL",
			slog.String("email", req.Email),
			slog.Any("error", err))
		return nil, err
	}

	// For manual flow, return the auth URL for the frontend to handle
	return &LoginResponse{
		AuthCode:      authURL,
		RedirectURI:   s.config.OAuth.RedirectURI,
		HasOTPEnabled: user.OTPEnabled,
		OTPValidated:  user.OTPValidated,
	}, nil
}
