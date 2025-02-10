// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/service/introspection/service.go
package introspection

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/config"
	dom_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/token"
	uc_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/oauth"
	uc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/token"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/user"
)

// Custom error types for better error handling
type TokenExpiredError struct {
	Message string
	Cause   error
}

func (e *TokenExpiredError) Error() string {
	if e.Cause != nil {
		return fmt.Sprintf("%s: %v", e.Message, e.Cause)
	}
	return e.Message
}

// Request/Response types
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

// Service interface
type IntrospectionService interface {
	IntrospectToken(ctx context.Context, req *IntrospectionRequest) (*IntrospectionResponse, error)
}

// Service implementation
type introspectionServiceImpl struct {
	config                 *config.Configuration
	logger                 *slog.Logger
	introspectTokenUseCase uc_oauth.IntrospectTokenUseCase
	tokenGetUseCase        uc_token.TokenGetByUserIDUseCase
	tokenUpsertUseCase     uc_token.TokenUpsertByUserIDUseCase
	refreshTokenUseCase    uc_oauth.RefreshTokenUseCase
	userGetByIDUseCase     uc_user.UserGetByIDUseCase
}

// Constructor
func NewIntrospectionService(
	cfg *config.Configuration,
	logger *slog.Logger,
	introspectTokenUseCase uc_oauth.IntrospectTokenUseCase,
	tokenGetUseCase uc_token.TokenGetByUserIDUseCase,
	tokenUpsertUseCase uc_token.TokenUpsertByUserIDUseCase,
	refreshTokenUseCase uc_oauth.RefreshTokenUseCase,
	userGetByIDUseCase uc_user.UserGetByIDUseCase,
) IntrospectionService {
	return &introspectionServiceImpl{
		config:                 cfg,
		logger:                 logger,
		introspectTokenUseCase: introspectTokenUseCase,
		tokenGetUseCase:        tokenGetUseCase,
		tokenUpsertUseCase:     tokenUpsertUseCase,
		refreshTokenUseCase:    refreshTokenUseCase,
		userGetByIDUseCase:     userGetByIDUseCase,
	}
}

// Main service method
func (s *introspectionServiceImpl) IntrospectToken(ctx context.Context, req *IntrospectionRequest) (*IntrospectionResponse, error) {
	// If user ID is provided, verify token ownership first
	if req.UserID != "" {
		userID, err := primitive.ObjectIDFromHex(req.UserID)
		if err != nil {
			return nil, fmt.Errorf("invalid user ID format: %w", err)
		}

		storedToken, err := s.tokenGetUseCase.Execute(ctx, userID)
		if err != nil {
			return nil, fmt.Errorf("getting stored token: %w", err)
		}
		if storedToken == nil {
			s.logger.Error("no stored token found", slog.String("user_id", req.UserID))
			return &IntrospectionResponse{Active: false}, nil
		}

		// If token is expired, try to refresh it
		if time.Now().After(storedToken.ExpiresAt) {
			refreshedToken, err := s.refreshToken(ctx, storedToken)
			if err != nil {
				s.logger.Error("token refresh failed",
					slog.String("user_id", req.UserID),
					slog.Any("error", err))
				return &IntrospectionResponse{Active: false}, nil
			}
			// Use the refreshed token for introspection
			req.Token = refreshedToken.AccessToken
		} else {
			// Use the stored token
			req.Token = storedToken.AccessToken
		}
	}

	// Now proceed with introspection
	introspectResp, err := s.introspectTokenUseCase.Execute(ctx, req.Token)
	if err != nil {
		return nil, fmt.Errorf("introspecting token: %w", err)
	}

	// Check if client ID matches our OAuth client ID
	if introspectResp.ClientID != s.config.OAuth.ClientID {
		s.logger.Warn("client ID mismatch",
			slog.String("expected", s.config.OAuth.ClientID),
			slog.String("received", introspectResp.ClientID))
		return &IntrospectionResponse{
			Active: false,
		}, nil
	}

	if !introspectResp.Active {
		return &IntrospectionResponse{Active: false}, nil
	}

	// For active tokens, fetch additional user information
	if introspectResp.UserID != "" {
		userID, err := primitive.ObjectIDFromHex(introspectResp.UserID)
		if err != nil {
			return nil, fmt.Errorf("invalid user ID from introspection: %w", err)
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

	// Return basic response if no user info
	return &IntrospectionResponse{Active: true}, nil
}

// Helper method to refresh tokens
func (s *introspectionServiceImpl) refreshToken(ctx context.Context, oldToken *dom_token.Token) (*dom_token.Token, error) {
	// Only attempt refresh if we have a refresh token
	if oldToken.RefreshToken == "" {
		return nil, errors.New("no refresh token available")
	}

	// Try to get a new token using the refresh token
	tokenResp, err := s.refreshTokenUseCase.Execute(ctx, oldToken.RefreshToken)
	if err != nil {
		return nil, fmt.Errorf("refreshing token: %w", err)
	}

	// Create new token record
	newToken := &dom_token.Token{
		ID:           primitive.NewObjectID(),
		UserID:       oldToken.UserID,
		AccessToken:  tokenResp.AccessToken,
		RefreshToken: tokenResp.RefreshToken,
		ExpiresAt:    tokenResp.ExpiresAt,
	}

	// Store the new token
	if err := s.tokenUpsertUseCase.Execute(ctx, newToken); err != nil {
		return nil, fmt.Errorf("storing refreshed token: %w", err)
	}

	return newToken, nil
}
