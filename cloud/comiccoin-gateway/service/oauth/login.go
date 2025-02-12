// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/service/oauth/login.go
package oauth

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/security/password"
	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/security/securestring"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/config"
	uc_auth "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/usecase/authorization"
	uc_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/usecase/federatedidentity"
)

// LoginResultDTO represents the response after successful login
type LoginResultDTO struct {
	Code        string // The authorization code to be sent to the client
	RedirectURI string // The URI where the client should be redirected
	State       string // Optional state parameter for CSRF protection
}

// LoginService defines the interface for handling OAuth login operations
type LoginService interface {
	ProcessLogin(ctx context.Context, username, password, authID string) (*LoginResultDTO, error)
}

type loginServiceImpl struct {
	cfg              *config.Configuration
	logger           *slog.Logger
	passwordProvider password.Provider

	federatedidentityGetByEmailUseCase uc_federatedidentity.FederatedIdentityGetByEmailUseCase
	authFindByCodeUseCase              uc_auth.AuthorizationFindByCodeUseCase
	authStoreCodeUseCase               uc_auth.AuthorizationStoreCodeUseCase
	authDeleteExpiredCodesUseCase      uc_auth.AuthorizationDeleteExpiredCodesUseCase
}

func (s *loginServiceImpl) ProcessLogin(ctx context.Context, username, password, authID string) (*LoginResultDTO, error) {
	// Input sanitization code remains the same...

	// Look up the pending authorization first, since we need its information
	authCode, err := s.authFindByCodeUseCase.Execute(ctx, authID)
	if err != nil {
		s.logger.Error("failed to find authorization",
			slog.Any("error", err))
		return nil, fmt.Errorf("authorization not found")
	}

	// Validate inputs
	e := make(map[string]string)
	if username == "" {
		e["username"] = "Email address is required"
	}
	if password == "" {
		e["password"] = "Password is required"
	}
	if len(e) != 0 {
		s.logger.Warn("login validation failed",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	// Look up the federatedidentity
	federatedidentity, err := s.federatedidentityGetByEmailUseCase.Execute(ctx, username)
	if err != nil {
		s.logger.Error("database error during login",
			slog.Any("error", err))
		return nil, err
	}
	if federatedidentity == nil {
		s.logger.Warn("federatedidentity does not exist")
		return nil, httperror.NewForBadRequestWithSingleField("username", "Email address does not exist")
	}

	// Create secure string for password comparison
	securePassword, err := sstring.NewSecureString(password)
	if err != nil {
		s.logger.Error("failed to create secure string",
			slog.Any("error", err))
		return nil, err
	}

	// Verify password using the password provider
	passwordMatch, _ := s.passwordProvider.ComparePasswordAndHash(securePassword, federatedidentity.PasswordHash)
	if !passwordMatch {
		s.logger.Warn("password verification failed")
		return nil, httperror.NewForBadRequestWithSingleField("password", "Invalid password")
	}

	// DEVELOPERS NOTE: Turn this feature off for now.
	// // Verify email was validated
	// if !federatedidentity.WasEmailVerified {
	// 	s.logger.Warn("unverified email attempt",
	// 		slog.String("email", username))
	// 	return nil, httperror.NewForBadRequestWithSingleField("email", "Email address not verified")
	// }

	// Update the authorization with the verified federatedidentity ID
	authCode.FederatedIdentityID = federatedidentity.ID.Hex()

	// Store the updated authorization
	if err := s.authStoreCodeUseCase.Execute(ctx, authCode); err != nil {
		s.logger.Error("failed to update authorization",
			slog.Any("error", err))
		return nil, fmt.Errorf("failed to update authorization")
	}

	// Clean up expired codes in the background
	go func() {
		if err := s.authDeleteExpiredCodesUseCase.Execute(context.Background()); err != nil {
			s.logger.Error("failed to cleanup expired codes",
				slog.Any("error", err))
		}
	}()

	// Note: We get the state from the URL query parameters, not from authCode
	return &LoginResultDTO{
		Code:        authCode.Code,
		RedirectURI: authCode.RedirectURI,
		State:       "", // We'll need to pass this through from the original request
	}, nil
}

func NewLoginService(
	cfg *config.Configuration,
	logger *slog.Logger,
	pp password.Provider,
	federatedidentityGetByEmailUseCase uc_federatedidentity.FederatedIdentityGetByEmailUseCase,
	authFindByCodeUseCase uc_auth.AuthorizationFindByCodeUseCase,
	authStoreCodeUseCase uc_auth.AuthorizationStoreCodeUseCase,
	authDeleteExpiredCodesUseCase uc_auth.AuthorizationDeleteExpiredCodesUseCase,
) LoginService {
	return &loginServiceImpl{
		cfg:                                cfg,
		logger:                             logger,
		passwordProvider:                   pp,
		federatedidentityGetByEmailUseCase: federatedidentityGetByEmailUseCase,
		authFindByCodeUseCase:              authFindByCodeUseCase,
		authStoreCodeUseCase:               authStoreCodeUseCase,
		authDeleteExpiredCodesUseCase:      authDeleteExpiredCodesUseCase,
	}
}
