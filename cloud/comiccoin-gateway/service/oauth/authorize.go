// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/service/oauth/authorize.go
package oauth

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"log/slog"
	"strings"
	"time"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/domain/authorization"
	uc_app "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/usecase/application"
	uc_auth "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/usecase/authorization"
)

type AuthorizeService interface {
	ValidateAuthorizationRequest(ctx context.Context, clientID, redirectURI, responseType, state, scope string) error
	CreatePendingAuthorization(ctx context.Context, clientID, redirectURI, state, scope string) (string, error)
	UpdatePendingAuthorization(ctx context.Context, code string, federatedidentityID string) error
}

type authorizeServiceImpl struct {
	cfg    *config.Configuration
	logger *slog.Logger

	appValidateCredentialsUseCase uc_app.ApplicationValidateCredentialsUseCase
	appFindByAppIDUseCase         uc_app.ApplicationFindByAppIDUseCase
	authFindByCodeUseCase         uc_auth.AuthorizationFindByCodeUseCase
	authStoreCodeUseCase          uc_auth.AuthorizationStoreCodeUseCase
	authUpdateCodeUseCase         uc_auth.AuthorizationUpdateCodeUseCase
}

func NewAuthorizeService(
	cfg *config.Configuration,
	logger *slog.Logger,
	appValidateCredentialsUseCase uc_app.ApplicationValidateCredentialsUseCase,
	appFindByAppIDUseCase uc_app.ApplicationFindByAppIDUseCase,
	authFindByCodeUseCase uc_auth.AuthorizationFindByCodeUseCase,
	authStoreCodeUseCase uc_auth.AuthorizationStoreCodeUseCase,
	authUpdateCodeUseCase uc_auth.AuthorizationUpdateCodeUseCase,
) AuthorizeService {
	return &authorizeServiceImpl{
		cfg:                           cfg,
		logger:                        logger,
		appValidateCredentialsUseCase: appValidateCredentialsUseCase,
		appFindByAppIDUseCase:         appFindByAppIDUseCase,
		authFindByCodeUseCase:         authFindByCodeUseCase,
		authStoreCodeUseCase:          authStoreCodeUseCase,
		authUpdateCodeUseCase:         authUpdateCodeUseCase,
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
		s.logger.Error("failed to find application", slog.Any("error", err))
		return fmt.Errorf("failed to find application: %w", err)
	}
	if app == nil {
		s.logger.Warn("application not found")
		return fmt.Errorf("application not found")
	}

	// Validate response type
	if responseType != "code" {
		s.logger.Warn("unsupported response type",
			slog.Any("invalid_response_type", responseType),
			slog.Any("allowed_response_types", "[code]"))
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
		s.logger.Warn("invalid redirect uri",
			slog.Any("invalid_uri", redirectURI),
			slog.Any("allowed_uris", app.RedirectURIs))
		return fmt.Errorf("invalid redirect URI")
	}

	// Validate requested scopes against allowed scopes
	// Note: This is a simplified scope validation. You might want to make it more sophisticated.
	if scope != "" {
		scope = strings.Replace(scope, " ", "", -1) // Defensive code
		splitScopes := strings.Split(scope, ",")
		for _, actualScope := range splitScopes {
			validScope := false
			for _, allowedScope := range app.Scopes {
				if actualScope == allowedScope {
					validScope = true
					break
				}
			}
			if !validScope {
				s.logger.Warn("invalid scope requested",
					slog.Any("invalid_scope", actualScope),
					slog.Any("allowed_scope", app.Scopes))
				return fmt.Errorf("invalid scope requested")
			}
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
	// Note: We're adding default values for required fields
	authCode := &authorization.AuthorizationCode{
		Code:        code,
		AppID:       clientID,
		RedirectURI: redirectURI,
		Scope:       "read",    // Set a default scope - adjust based on your needs
		FederatedIdentityID:      "pending", // We'll update this after federatedidentity login
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

func (s *authorizeServiceImpl) UpdatePendingAuthorization(ctx context.Context, code string, federatedidentityID string) error {
	// First find the existing authorization code
	authCode, err := s.authFindByCodeUseCase.Execute(ctx, code)
	if err != nil {
		s.logger.Error("failed to find authorization code",
			slog.String("code", code),
			slog.Any("error", err))
		return fmt.Errorf("failed to find authorization code: %w", err)
	}
	if authCode == nil {
		return fmt.Errorf("authorization code not found")
	}

	// Update the federatedidentity ID
	authCode.FederatedIdentityID = federatedidentityID

	// Store the updated authorization code using UpdateCode, not StoreCode
	return s.authUpdateCodeUseCase.Execute(ctx, authCode) // You'll need to add this use case
}
