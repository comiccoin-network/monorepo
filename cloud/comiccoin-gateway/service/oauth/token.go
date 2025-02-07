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
	// Validate grant type
	if req.GrantType != "authorization_code" {
		return nil, fmt.Errorf("unsupported grant type: %s", req.GrantType)
	}

	// Validate client credentials
	valid, err := s.appValidateCredentialsUseCase.Execute(ctx, req.ClientID, req.ClientSecret)
	if err != nil {
		return nil, fmt.Errorf("failed to validate client credentials: %w", err)
	}
	if !valid {
		return nil, fmt.Errorf("invalid client credentials")
	}

	// Get and validate the authorization code
	authCode, err := s.authFindByCodeUseCase.Execute(ctx, req.Code)
	if err != nil {
		return nil, fmt.Errorf("failed to find authorization code: %w", err)
	}

	// Verify the client ID and redirect URI match
	if authCode.AppID != req.ClientID {
		return nil, fmt.Errorf("authorization code was not issued to this client")
	}
	if authCode.RedirectURI != req.RedirectURI {
		return nil, fmt.Errorf("redirect URI mismatch")
	}

	// Mark the authorization code as used
	if err := s.authMarkCodeAsUsedUseCase.Execute(ctx, req.Code); err != nil {
		return nil, fmt.Errorf("failed to mark code as used: %w", err)
	}

	// Generate and store the access token
	token := &dom_token.Token{
		TokenType:  "access",
		UserID:     authCode.UserID,
		AppID:      authCode.AppID,
		Scope:      authCode.Scope,
		ExpiresAt:  time.Now().Add(time.Hour), // 1 hour expiration
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
