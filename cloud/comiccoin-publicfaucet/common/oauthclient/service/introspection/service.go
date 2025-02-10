// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/service/introspection/service.go
package introspection

import (
	"context"
	"errors"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/config"
	dom_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/user"
	uc_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/oauth"
	uc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/token"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/user"
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

	// Response validation
	if introspectResp.UserID == "" {
		s.logger.Warn("introspection response did not include `user_id` field",
			slog.String("user_id", introspectResp.UserID))
		return nil, errors.New("user_is is required")
	}

	// Convert Unix timestamps to time.Time
	expiresAt := time.Unix(introspectResp.ExpiresAt, 0)
	issuedAt := time.Unix(introspectResp.IssuedAt, 0)

	// Create user from introspection response
	var user *dom_user.User
	userID, err := primitive.ObjectIDFromHex(introspectResp.UserID)
	if err != nil {
		s.logger.Error("failed to parse user ID from introspection response",
			slog.String("user_id", introspectResp.UserID),
			slog.Any("error", err))
		return nil, err
	}

	// Build base response
	response := &IntrospectionResponse{
		Active:    introspectResp.Active,
		Scope:     introspectResp.Scope,
		ClientID:  introspectResp.ClientID,
		ExpiresAt: expiresAt,
		IssuedAt:  issuedAt,
		User:      user,
	}

	// If user ID is not provided in request, return basic response
	if introspectResp.UserID == "" {
		s.logger.Warn("`user_id` is not provided in request",
			slog.String("user_id", introspectResp.UserID))
		return response, nil
	}

	// Get stored token to verify ownership
	storedToken, err := s.tokenGetUseCase.Execute(ctx, userID)
	if err != nil {
		s.logger.Error("failed to get stored token",
			slog.Any("user_id", userID),
			slog.Any("error", err))
		return response, nil
	}

	if storedToken == nil {
		s.logger.Error("no stored token found",
			slog.Any("user_id", userID))
		return response, nil
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

	// Optionally get additional user details from database
	dbUser, err := s.userGetByIDUseCase.Execute(ctx, userID)
	if err != nil {
		s.logger.Error("failed to get user from database",
			slog.Any("user_id", userID),
			slog.Any("error", err))
		return response, nil
	}

	// Update OTP status if we have database user info
	if dbUser != nil {
		response.RequiresOTP = dbUser.OTPEnabled && !dbUser.OTPValidated
		// Update user with any additional fields from database if needed
		response.User = dbUser
	}

	s.logger.Debug("introspection finished",
		slog.Any("user_id", userID),
		slog.Any("response.User", response.User))

	return response, nil
}
