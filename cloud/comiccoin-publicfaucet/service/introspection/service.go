// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/service/introspection/service.go
package introspection

import (
	"context"
	"errors"
	"fmt"
	"log"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/config"
	dom_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/domain/user"
	uc_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/usecase/oauth"
	uc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/usecase/token"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/usecase/user"
)

type IntrospectionRequest struct {
	AccessToken string `json:"access_token"`
	UserID      string `json:"user_id"`
}

type IntrospectionResponse struct {
	Active      bool           `json:"active"`
	Scope       string         `json:"scope"`
	ClientID    string         `json:"client_id"`
	ExpiresAt   time.Time      `json:"expires_at"` // Keep as time.Time for service layer
	IssuedAt    time.Time      `json:"issued_at"`  // Keep as time.Time for service layer
	User        *dom_user.User `json:"user"`
	RequiresOTP bool           `json:"requires_otp"`
}

type IntrospectionService interface {
	IntrospectToken(ctx context.Context, req *IntrospectionRequest) (*IntrospectionResponse, error)
}

type introspectionServiceImpl struct {
	config                 *config.Configuration
	logger                 *slog.Logger
	introspectTokenUseCase uc_oauth.IntrospectTokenUseCase
	tokenGetUseCase        uc_token.TokenGetByUserIDUseCase
	userGetByIDUseCase     uc_user.UserGetByIDUseCase
}

func NewIntrospectionService(
	config *config.Configuration,
	logger *slog.Logger,
	introspectTokenUseCase uc_oauth.IntrospectTokenUseCase,
	tokenGetUseCase uc_token.TokenGetByUserIDUseCase,
	userGetByIDUseCase uc_user.UserGetByIDUseCase,
) IntrospectionService {
	return &introspectionServiceImpl{
		config:                 config,
		logger:                 logger,
		introspectTokenUseCase: introspectTokenUseCase,
		tokenGetUseCase:        tokenGetUseCase,
		userGetByIDUseCase:     userGetByIDUseCase,
	}
}

func (s *introspectionServiceImpl) IntrospectToken(ctx context.Context, req *IntrospectionRequest) (*IntrospectionResponse, error) {
	// Input validation
	if req.AccessToken == "" {
		return nil, errors.New("access_token is required")
	}

	// Introspect token with OAuth server
	introspectResp, err := s.introspectTokenUseCase.Execute(ctx, req.AccessToken)
	if err != nil {
		s.logger.Error("failed to introspect token with OAuth server",
			slog.Any("error", err))
		return nil, err
	}

	// Convert Unix timestamps to time.Time
	expiresAt := time.Unix(introspectResp.ExpiresAt, 0)
	issuedAt := time.Unix(introspectResp.IssuedAt, 0)

	// If user ID is not provided, return basic introspection response
	if req.UserID == "" {
		return &IntrospectionResponse{
			Active:    introspectResp.Active,
			Scope:     introspectResp.Scope,
			ClientID:  introspectResp.ClientID,
			ExpiresAt: expiresAt,
			IssuedAt:  issuedAt,
		}, nil
	}

	// If user ID is provided, continue with full validation
	userID, err := primitive.ObjectIDFromHex(req.UserID)
	if err != nil {
		s.logger.Error("invalid user_id format",
			slog.String("user_id", req.UserID),
			slog.Any("error", err))
		return nil, fmt.Errorf("invalid user ID format: %v", err)
	}

	// Get user details
	user, err := s.userGetByIDUseCase.Execute(ctx, userID)
	if err != nil {
		s.logger.Error("failed to get user",
			slog.Any("user_id", userID),
			slog.Any("error", err))
		// Return base response instead of failing
		return &IntrospectionResponse{
			Active:    introspectResp.Active,
			Scope:     introspectResp.Scope,
			ClientID:  introspectResp.ClientID,
			ExpiresAt: expiresAt,
			IssuedAt:  issuedAt,
		}, nil
	}

	// Get stored token to verify ownership
	storedToken, err := s.tokenGetUseCase.Execute(ctx, userID)
	if err != nil {
		s.logger.Error("failed to get stored token",
			slog.Any("user_id", userID),
			slog.Any("error", err))
		// Return base response instead of failing
		return &IntrospectionResponse{
			Active:    introspectResp.Active,
			Scope:     introspectResp.Scope,
			ClientID:  introspectResp.ClientID,
			ExpiresAt: expiresAt,
			IssuedAt:  issuedAt,
		}, nil
	}

	if storedToken == nil {
		s.logger.Error("No stored token failure", slog.Any("userID", userID))
		log.Fatalf("No stored token for userID: %v", userID)
	}

	// Verify token ownership
	if storedToken.AccessToken != req.AccessToken {
		s.logger.Warn("access token mismatch",
			slog.Any("user_id", userID))
		return &IntrospectionResponse{
			Active: false,
		}, nil
	}

	// Check if client ID matches our OAuth client ID
	if introspectResp.ClientID != s.config.OAuth.ClientID {
		s.logger.Warn("client ID mismatch",
			slog.Any("user_id", userID),
			slog.String("expected", s.config.OAuth.ClientID),
			slog.String("received", introspectResp.ClientID))
		return &IntrospectionResponse{
			Active: false,
		}, nil
	}

	// Build full response with user details
	requiresOTP := false
	if user != nil {
		requiresOTP = user.OTPEnabled && !user.OTPValidated
	}

	return &IntrospectionResponse{
		Active:      introspectResp.Active,
		Scope:       introspectResp.Scope,
		ClientID:    introspectResp.ClientID,
		ExpiresAt:   expiresAt,
		IssuedAt:    issuedAt,
		User:        user,
		RequiresOTP: requiresOTP,
	}, nil
}
