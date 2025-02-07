// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/service/oauth/introspect.go
package oauth

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/config"
	uc_app "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/usecase/application"
	uc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/usecase/token"
)

// IntrospectionRequestDTO represents the input for token introspection
type IntrospectionRequestDTO struct {
	Token        string // The token to introspect
	ClientID     string // Client credentials for authentication
	ClientSecret string
}

// IntrospectionResponseDTO represents the OAuth 2.0 token introspection response
type IntrospectionResponseDTO struct {
	Active    bool   `json:"active"`              // Indicates if the token is valid and active
	Scope     string `json:"scope,omitempty"`     // The scope associated with the token
	ClientID  string `json:"client_id,omitempty"` // Client ID the token was issued to
	Username  string `json:"username,omitempty"`  // Username of the resource owner
	ExpiresAt int64  `json:"exp,omitempty"`       // Token expiration timestamp
	IssuedAt  int64  `json:"iat,omitempty"`       // When the token was issued
}

type IntrospectionService interface {
	IntrospectToken(ctx context.Context, req *IntrospectionRequestDTO) (*IntrospectionResponseDTO, error)
}

type introspectionServiceImpl struct {
	cfg    *config.Configuration
	logger *slog.Logger

	appValidateCredentialsUseCase uc_app.ApplicationValidateCredentialsUseCase
	tokenFindByIDUseCase          uc_token.TokenFindByIDUseCase
}

func NewIntrospectionService(
	cfg *config.Configuration,
	logger *slog.Logger,
	appValidateCredentialsUseCase uc_app.ApplicationValidateCredentialsUseCase,
	tokenFindByIDUseCase uc_token.TokenFindByIDUseCase,
) IntrospectionService {
	return &introspectionServiceImpl{
		cfg:                           cfg,
		logger:                        logger,
		appValidateCredentialsUseCase: appValidateCredentialsUseCase,
		tokenFindByIDUseCase:          tokenFindByIDUseCase,
	}
}

func (s *introspectionServiceImpl) IntrospectToken(ctx context.Context, req *IntrospectionRequestDTO) (*IntrospectionResponseDTO, error) {
	// First validate the client credentials
	valid, err := s.appValidateCredentialsUseCase.Execute(ctx, req.ClientID, req.ClientSecret)
	if err != nil {
		return nil, fmt.Errorf("failed to validate client credentials: %w", err)
	}
	if !valid {
		return nil, fmt.Errorf("invalid client credentials")
	}

	// Find the token in our storage
	tokenInfo, err := s.tokenFindByIDUseCase.Execute(ctx, req.Token)
	if err != nil {
		// For security reasons, we return an inactive token response rather than an error
		return &IntrospectionResponseDTO{
			Active: false,
		}, nil
	}

	// Check if the token is still valid
	isActive := !tokenInfo.IsRevoked && time.Now().Before(tokenInfo.ExpiresAt)

	// If token is not active, return minimal response
	if !isActive {
		return &IntrospectionResponseDTO{
			Active: false,
		}, nil
	}

	// Return full token information for active tokens
	return &IntrospectionResponseDTO{
		Active:    true,
		Scope:     tokenInfo.Scope,
		ClientID:  tokenInfo.AppID, // Note: Using AppID from our domain model
		ExpiresAt: tokenInfo.ExpiresAt.Unix(),
		IssuedAt:  tokenInfo.IssuedAt.Unix(),
	}, nil
}
