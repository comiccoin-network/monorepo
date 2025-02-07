// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/service/oauth/token.go
package oauth

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/config"
	dom_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/domain/token"
	uc_app "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/usecase/application"
	uc_auth "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/usecase/authorization"
	uc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/usecase/token"
)

// TokenRequestDTO represents the incoming request for token exchange
type TokenRequestDTO struct {
	GrantType    string
	Code         string
	ClientID     string
	ClientSecret string
	RedirectURI  string
}

// TokenResponseDTO represents the response for a successful token exchange
type TokenResponseDTO struct {
	AccessToken  string `json:"access_token"`
	TokenType    string `json:"token_type"`
	ExpiresIn    int    `json:"expires_in"`
	RefreshToken string `json:"refresh_token,omitempty"`
	Scope        string `json:"scope,omitempty"`
}

// TokenErrorDTO represents an OAuth 2.0 error response
type TokenErrorDTO struct {
	Error            string `json:"error"`
	ErrorDescription string `json:"error_description"`
}

type TokenService interface {
	ExchangeToken(ctx context.Context, req *TokenRequestDTO) (*TokenResponseDTO, error)
}

type tokenServiceImpl struct {
	cfg    *config.Configuration
	logger *slog.Logger

	appValidateCredentialsUseCase uc_app.ApplicationValidateCredentialsUseCase
	authFindByCodeUseCase         uc_auth.AuthorizationFindByCodeUseCase
	authMarkCodeAsUsedUseCase     uc_auth.AuthorizationMarkCodeAsUsedUseCase
	tokenStoreUseCase             uc_token.TokenStoreUseCase
}

func NewTokenService(
	cfg *config.Configuration,
	logger *slog.Logger,
	appValidateCredentialsUseCase uc_app.ApplicationValidateCredentialsUseCase,
	authFindByCodeUseCase uc_auth.AuthorizationFindByCodeUseCase,
	authMarkCodeAsUsedUseCase uc_auth.AuthorizationMarkCodeAsUsedUseCase,
	tokenStoreUseCase uc_token.TokenStoreUseCase,
) TokenService {
	return &tokenServiceImpl{
		cfg:                           cfg,
		logger:                        logger,
		appValidateCredentialsUseCase: appValidateCredentialsUseCase,
		authFindByCodeUseCase:         authFindByCodeUseCase,
		authMarkCodeAsUsedUseCase:     authMarkCodeAsUsedUseCase,
		tokenStoreUseCase:             tokenStoreUseCase,
	}
}

func (s *tokenServiceImpl) ExchangeToken(ctx context.Context, req *TokenRequestDTO) (*TokenResponseDTO, error) {
	s.logger.Info("starting token exchange flow",
		slog.String("code", req.Code),
		slog.String("client_id", req.ClientID),
		slog.String("redirect_uri", req.RedirectURI))

	// Validate client credentials
	valid, err := s.appValidateCredentialsUseCase.Execute(ctx, req.ClientID, req.ClientSecret)
	if err != nil {
		s.logger.Error("client credentials validation failed",
			slog.String("client_id", req.ClientID),
			slog.Any("error", err))
		return nil, fmt.Errorf("failed to validate client credentials: %w", err)
	}
	if !valid {
		s.logger.Error("invalid client credentials",
			slog.String("client_id", req.ClientID))
		return nil, fmt.Errorf("invalid client credentials")
	}
	s.logger.Debug("client credentials validated successfully")

	// Get and validate the authorization code
	authCode, err := s.authFindByCodeUseCase.Execute(ctx, req.Code)
	if err != nil {
		s.logger.Error("failed to find authorization code",
			slog.String("code", req.Code),
			slog.Any("error", err))
		return nil, fmt.Errorf("failed to find authorization code: %w", err)
	}
	if authCode == nil {
		s.logger.Error("authorization code not found",
			slog.String("code", req.Code))
		return nil, fmt.Errorf("authorization code not found")
	}
	s.logger.Debug("found authorization code",
		slog.Any("auth_code", authCode))

	// Verify client ID matches
	if authCode.AppID != req.ClientID {
		s.logger.Error("client ID mismatch",
			slog.String("auth_code_client", authCode.AppID),
			slog.String("request_client", req.ClientID))
		return nil, fmt.Errorf("authorization code was not issued to this client")
	}

	// Verify redirect URI matches
	if authCode.RedirectURI != req.RedirectURI {
		s.logger.Error("redirect URI mismatch",
			slog.String("auth_code_uri", authCode.RedirectURI),
			slog.String("request_uri", req.RedirectURI))
		return nil, fmt.Errorf("redirect URI mismatch")
	}

	// Check if code is already used
	if authCode.IsUsed {
		s.logger.Error("authorization code already used",
			slog.String("code", req.Code))
		return nil, fmt.Errorf("authorization code already used")
	}

	// Check if code is expired
	if time.Now().After(authCode.ExpiresAt) {
		s.logger.Error("authorization code expired",
			slog.String("code", req.Code),
			slog.Time("expired_at", authCode.ExpiresAt))
		return nil, fmt.Errorf("authorization code expired")
	}

	// Mark the authorization code as used
	if err := s.authMarkCodeAsUsedUseCase.Execute(ctx, req.Code); err != nil {
		return nil, fmt.Errorf("failed to mark code as used: %w", err)
	}

	// Generate token ID using the same method from refresh.go
	tokenID, err := generateToken() // Reuse the function from refresh.go
	if err != nil {
		s.logger.Error("failed to generate token ID", slog.Any("error", err))
		return nil, fmt.Errorf("failed to generate token")
	}

	// Create and store access token
	token := &dom_token.Token{
		TokenID:    tokenID, // Add this line
		TokenType:  "access",
		UserID:     authCode.UserID,
		AppID:      authCode.AppID,
		Scope:      authCode.Scope,
		ExpiresAt:  time.Now().Add(time.Hour),
		IssuedAt:   time.Now(),
		IsRevoked:  false,
		LastUsedAt: time.Now(),
	}

	if err := s.tokenStoreUseCase.Execute(ctx, token); err != nil {
		return nil, fmt.Errorf("failed to store token: %w", err)
	}

	// Return the token response
	return &TokenResponseDTO{
		AccessToken: token.TokenID,
		TokenType:   "Bearer",
		ExpiresIn:   3600, // 1 hour in seconds
		Scope:       token.Scope,
	}, nil
}
