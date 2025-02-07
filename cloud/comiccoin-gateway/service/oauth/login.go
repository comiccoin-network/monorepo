// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/service/oauth/login.go
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
	uc_auth "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/usecase/authorization"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/usecase/user"
)

// LoginResultDTO represents the data transfer object that carries
// the authorization result from the service layer to the HTTP layer.
// Using the DTO suffix helps clarify its role in transferring data
// between architectural layers.
type LoginResultDTO struct {
	Code        string // The authorization code to be sent to the client
	RedirectURI string // The URI where the client should be redirected
	State       string // Optional state parameter for CSRF protection
}

type LoginService interface {
	ProcessLogin(ctx context.Context, username, password, authID string) (*LoginResultDTO, error)
}

type loginServiceImpl struct {
	cfg    *config.Configuration
	logger *slog.Logger

	userGetByEmailUseCase         uc_user.UserGetByEmailUseCase
	authFindByCodeUseCase         uc_auth.AuthorizationFindByCodeUseCase
	authStoreCodeUseCase          uc_auth.AuthorizationStoreCodeUseCase
	authDeleteExpiredCodesUseCase uc_auth.AuthorizationDeleteExpiredCodesUseCase
}

func NewLoginService(
	cfg *config.Configuration,
	logger *slog.Logger,
	userGetByEmailUseCase uc_user.UserGetByEmailUseCase,
	authFindByCodeUseCase uc_auth.AuthorizationFindByCodeUseCase,
	authStoreCodeUseCase uc_auth.AuthorizationStoreCodeUseCase,
	authDeleteExpiredCodesUseCase uc_auth.AuthorizationDeleteExpiredCodesUseCase,
) LoginService {
	return &loginServiceImpl{
		cfg:                           cfg,
		logger:                        logger,
		userGetByEmailUseCase:         userGetByEmailUseCase,
		authFindByCodeUseCase:         authFindByCodeUseCase,
		authStoreCodeUseCase:          authStoreCodeUseCase,
		authDeleteExpiredCodesUseCase: authDeleteExpiredCodesUseCase,
	}
}

// generateAuthCode creates a cryptographically secure random string for authorization codes
func generateAuthCode() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", fmt.Errorf("failed to generate auth code: %w", err)
	}
	return base64.URLEncoding.EncodeToString(b)[:32], nil
}

func (s *loginServiceImpl) ProcessLogin(ctx context.Context, username, password, authID string) (*LoginResultDTO, error) {
	// Validate user credentials by looking up the user
	user, err := s.userGetByEmailUseCase.Execute(ctx, username)
	if err != nil {
		return nil, fmt.Errorf("failed to validate user credentials: %w", err)
	}
	if user == nil {
		return nil, fmt.Errorf("invalid credentials")
	}

	// TODO: Add password validation logic here
	// Note: In a real implementation, you would safely compare password hashes
	if password != user.PasswordHash { // This is just for demonstration
		return nil, fmt.Errorf("invalid credentials")
	}

	// Generate a new authorization code
	code, err := generateAuthCode()
	if err != nil {
		return nil, fmt.Errorf("failed to generate authorization code: %w", err)
	}

	// Create the authorization code record
	authCode := &authorization.AuthorizationCode{
		Code:      code,
		UserID:    user.ID.Hex(), // Convert ObjectID to string
		ExpiresAt: time.Now().Add(10 * time.Minute),
		IsUsed:    false,
		CreatedAt: time.Now(),
	}

	// Store the authorization code
	if err := s.authStoreCodeUseCase.Execute(ctx, authCode); err != nil {
		return nil, fmt.Errorf("failed to store authorization code: %w", err)
	}

	// Clean up expired codes as a background task
	go func() {
		if err := s.authDeleteExpiredCodesUseCase.Execute(context.Background()); err != nil {
			s.logger.Error("failed to cleanup expired codes",
				slog.Any("error", err))
		}
	}()

	return &LoginResultDTO{
		Code:        code,
		RedirectURI: authCode.RedirectURI,
		State:       "", // State would be retrieved from pending authorization
	}, nil
}
