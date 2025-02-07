// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/service/oauth/authorize.go
package oauth

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"log/slog"
	"time"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/domain/authorization"
	uc_app "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/usecase/application"
	uc_auth "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/usecase/authorization"
)

type AuthorizeService interface {
	ValidateAuthorizationRequest(ctx context.Context, clientID, redirectURI, responseType, state, scope string) error
	CreatePendingAuthorization(ctx context.Context, clientID, redirectURI, state, scope string) (string, error)
}

type authorizeServiceImpl struct {
	cfg    *config.Configuration
	logger *slog.Logger

	appValidateCredentialsUseCase uc_app.ApplicationValidateCredentialsUseCase
	appFindByAppIDUseCase         uc_app.ApplicationFindByAppIDUseCase
	authFindByCodeUseCase         uc_auth.AuthorizationFindByCodeUseCase
	authStoreCodeUseCase          uc_auth.AuthorizationStoreCodeUseCase
}

func NewAuthorizeService(
	cfg *config.Configuration,
	logger *slog.Logger,
	appValidateCredentialsUseCase uc_app.ApplicationValidateCredentialsUseCase,
	appFindByAppIDUseCase uc_app.ApplicationFindByAppIDUseCase,
	authFindByCodeUseCase uc_auth.AuthorizationFindByCodeUseCase,
	authStoreCodeUseCase uc_auth.AuthorizationStoreCodeUseCase,
) AuthorizeService {
	return &authorizeServiceImpl{
		cfg:                           cfg,
		logger:                        logger,
		appValidateCredentialsUseCase: appValidateCredentialsUseCase,
		appFindByAppIDUseCase:         appFindByAppIDUseCase,
		authFindByCodeUseCase:         authFindByCodeUseCase,
		authStoreCodeUseCase:          authStoreCodeUseCase,
	}
}

// generateRandomString creates a cryptographically secure random string
func generateRandomString(length int) (string, error) {
	b := make([]byte, length)
	if _, err := rand.Read(b); err != nil {
		return "", fmt.Errorf("failed to generate random string: %w", err)
	}
	return base64.URLEncoding.EncodeToString(b)[:length], nil
}

// ValidateAuthorizationRequest validates the OAuth authorization request parameters
// by coordinating between application-related use cases
func (s *authorizeServiceImpl) ValidateAuthorizationRequest(ctx context.Context, clientID, redirectURI, responseType, state, scope string) error {
	// First check if the application exists
	app, err := s.appFindByAppIDUseCase.Execute(ctx, clientID)
	if err != nil {
		return fmt.Errorf("failed to find application: %w", err)
	}
	if app == nil {
		return fmt.Errorf("application not found")
	}

	// Validate response type
	if responseType != "code" {
		return fmt.Errorf("unsupported response type: %s", responseType)
	}

	// Validate redirect URI matches one of the registered URIs
	validRedirectURI := false
	for _, uri := range app.RedirectURIs {
		if uri == redirectURI {
			validRedirectURI = true
			break
		}
	}
	if !validRedirectURI {
		return fmt.Errorf("invalid redirect URI")
	}

	// Validate requested scopes against allowed scopes
	// Note: This is a simplified scope validation. You might want to make it more sophisticated.
	if scope != "" {
		validScope := false
		for _, allowedScope := range app.Scopes {
			if scope == allowedScope {
				validScope = true
				break
			}
		}
		if !validScope {
			return fmt.Errorf("invalid scope requested")
		}
	}

	return nil
}

// CreatePendingAuthorization creates a new authorization code
func (s *authorizeServiceImpl) CreatePendingAuthorization(ctx context.Context, clientID, redirectURI, state, scope string) (string, error) {
	// Generate a unique authorization code
	code, err := generateRandomString(32)
	if err != nil {
		return "", fmt.Errorf("failed to generate authorization code: %w", err)
	}

	// Create an authorization code record
	authCode := &authorization.AuthorizationCode{
		Code:        code,
		AppID:       clientID,
		RedirectURI: redirectURI,
		Scope:       scope,
		ExpiresAt:   time.Now().Add(10 * time.Minute),
		IsUsed:      false,
		CreatedAt:   time.Now(),
	}

	// Store the authorization code using the use case
	if err := s.authStoreCodeUseCase.Execute(ctx, authCode); err != nil {
		return "", fmt.Errorf("failed to store authorization code: %w", err)
	}

	return code, nil
}
