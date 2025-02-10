// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/service/introspection/service.go
package introspection

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/config"
	uc_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/oauth"
	uc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/token"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/user"
)

// We define custom error types to differentiate between expiration scenarios
type TokenExpiredError struct {
	Message string
}

func (e *TokenExpiredError) Error() string {
	return e.Message
}

type SessionExpiredError struct {
	Message string
}

func (e *SessionExpiredError) Error() string {
	return e.Message
}

// Request/Response types remain the same
type IntrospectionRequest struct {
	Token  string
	UserID string // Optional - if provided, we verify token ownership
}

type IntrospectionResponse struct {
	Active    bool               `json:"active"`
	UserID    primitive.ObjectID `json:"user_id,omitempty"`
	Email     string             `json:"email,omitempty"`
	FirstName string             `json:"first_name,omitempty"`
	LastName  string             `json:"last_name,omitempty"`
}

// Service interface remains the same
type IntrospectionService interface {
	IntrospectToken(ctx context.Context, req *IntrospectionRequest) (*IntrospectionResponse, error)
}

// Service implementation with simplified dependencies
type introspectionServiceImpl struct {
	config                 *config.Configuration
	logger                 *slog.Logger
	introspectTokenUseCase uc_oauth.IntrospectTokenUseCase
	tokenGetUseCase        uc_token.TokenGetByUserIDUseCase
	userGetByIDUseCase     uc_user.UserGetByIDUseCase
}

func NewIntrospectionService(
	cfg *config.Configuration,
	logger *slog.Logger,
	introspectTokenUseCase uc_oauth.IntrospectTokenUseCase,
	tokenGetUseCase uc_token.TokenGetByUserIDUseCase,
	userGetByIDUseCase uc_user.UserGetByIDUseCase,
) IntrospectionService {
	return &introspectionServiceImpl{
		config:                 cfg,
		logger:                 logger,
		introspectTokenUseCase: introspectTokenUseCase,
		tokenGetUseCase:        tokenGetUseCase,
		userGetByIDUseCase:     userGetByIDUseCase,
	}
}

func (s *introspectionServiceImpl) IntrospectToken(ctx context.Context, req *IntrospectionRequest) (*IntrospectionResponse, error) {
	// If user ID is provided, verify token ownership and check expiration
	if req.UserID != "" {
		userID, err := primitive.ObjectIDFromHex(req.UserID)
		if err != nil {
			return nil, httperror.NewForBadRequest(&map[string]string{
				"user_id": "invalid format",
			})
		}

		// Get stored token to check expiration
		storedToken, err := s.tokenGetUseCase.Execute(ctx, userID)
		if err != nil {
			return nil, fmt.Errorf("getting stored token: %w", err)
		}
		if storedToken == nil {
			s.logger.Error("no stored token found", slog.String("user_id", req.UserID))
			return nil, &SessionExpiredError{Message: "No active session found. Please log in again."}
		}

		// Check for token expiration scenarios
		now := time.Now()

		// Both access token and refresh token are expired (session expired)
		if now.After(storedToken.ExpiresAt) && now.After(storedToken.ExpiresAt.Add(30*24*time.Hour)) {
			s.logger.Info("session expired, requires new login",
				slog.String("user_id", req.UserID))
			return nil, &SessionExpiredError{
				Message: "Your session has expired. Please log in again to continue.",
			}
		}

		// Only access token is expired (needs refresh)
		if now.After(storedToken.ExpiresAt) {
			s.logger.Info("access token expired, requires refresh",
				slog.String("user_id", req.UserID))
			return nil, &TokenExpiredError{
				Message: "Access token has expired. Please refresh your token to continue.",
			}
		}

		// Use the valid token for introspection
		req.Token = storedToken.AccessToken
	}

	// Proceed with introspection for valid tokens
	introspectResp, err := s.introspectTokenUseCase.Execute(ctx, req.Token)
	if err != nil {
		return nil, fmt.Errorf("introspecting token: %w", err)
	}

	// Verify client ID
	if introspectResp.ClientID != s.config.OAuth.ClientID {
		s.logger.Warn("client ID mismatch",
			slog.String("expected", s.config.OAuth.ClientID),
			slog.String("received", introspectResp.ClientID))
		return &IntrospectionResponse{Active: false}, nil
	}

	if !introspectResp.Active {
		return &IntrospectionResponse{Active: false}, nil
	}

	// Fetch user information for active tokens
	if introspectResp.UserID != "" {
		userID, err := primitive.ObjectIDFromHex(introspectResp.UserID)
		if err != nil {
			return nil, httperror.NewForBadRequest(&map[string]string{
				"user_id": "invalid format from introspection",
			})
		}

		user, err := s.userGetByIDUseCase.Execute(ctx, userID)
		if err != nil {
			return nil, fmt.Errorf("getting user info: %w", err)
		}

		return &IntrospectionResponse{
			Active:    true,
			UserID:    user.ID,
			Email:     user.Email,
			FirstName: user.FirstName,
			LastName:  user.LastName,
		}, nil
	}

	return &IntrospectionResponse{Active: true}, nil
}
