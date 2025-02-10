// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/service/oauth/introspect.go
package oauth

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/config"
	uc_app "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/usecase/application"
	uc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/usecase/token"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/usecase/user"
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
	UserID    string `json:"user_id,omitempty"`
	Email     string `json:"email,omitempty"`
	FirstName string `json:"first_name,omitempty"`
	LastName  string `json:"last_name,omitempty"`
}

type IntrospectionService interface {
	IntrospectToken(ctx context.Context, req *IntrospectionRequestDTO) (*IntrospectionResponseDTO, error)
}

type introspectionServiceImpl struct {
	cfg    *config.Configuration
	logger *slog.Logger

	appValidateCredentialsUseCase uc_app.ApplicationValidateCredentialsUseCase
	tokenFindByIDUseCase          uc_token.TokenFindByIDUseCase
	userGetByIDUseCase            uc_user.UserGetByIDUseCase
}

func NewIntrospectionService(
	cfg *config.Configuration,
	logger *slog.Logger,
	appValidateCredentialsUseCase uc_app.ApplicationValidateCredentialsUseCase,
	tokenFindByIDUseCase uc_token.TokenFindByIDUseCase,
	userGetByIDUseCase uc_user.UserGetByIDUseCase,
) IntrospectionService {
	return &introspectionServiceImpl{
		cfg:                           cfg,
		logger:                        logger,
		appValidateCredentialsUseCase: appValidateCredentialsUseCase,
		tokenFindByIDUseCase:          tokenFindByIDUseCase,
		userGetByIDUseCase:            userGetByIDUseCase,
	}
}

func (s *introspectionServiceImpl) IntrospectToken(ctx context.Context, req *IntrospectionRequestDTO) (*IntrospectionResponseDTO, error) {
	s.logger.Debug("starting token introspection",
		slog.String("token", req.Token),
		slog.String("client_id", req.ClientID))

	// First validate the client credentials
	valid, err := s.appValidateCredentialsUseCase.Execute(ctx, req.ClientID, req.ClientSecret)
	if err != nil {
		s.logger.Error("client credentials validation failed",
			slog.String("client_id", req.ClientID),
			slog.Any("error", err))
		return nil, fmt.Errorf("failed to validate client credentials: %w", err)
	}
	if !valid {
		s.logger.Warn("invalid client credentials",
			slog.String("client_id", req.ClientID))
		return nil, fmt.Errorf("invalid client credentials")
	}

	// Find the token in our storage
	tokenInfo, err := s.tokenFindByIDUseCase.Execute(ctx, req.Token)
	if err != nil {
		s.logger.Error("failed to find token",
			slog.String("token", req.Token),
			slog.Any("error", err))
		return &IntrospectionResponseDTO{Active: false}, nil
	}
	if tokenInfo == nil {
		s.logger.Warn("token not found",
			slog.String("token", req.Token))
		return &IntrospectionResponseDTO{Active: false}, nil
	}

	s.logger.Debug("found token",
		slog.String("token", req.Token),
		slog.String("user_id", tokenInfo.UserID),
		slog.String("app_id", tokenInfo.AppID),
		slog.Time("expires_at", tokenInfo.ExpiresAt))

	// Check if the token is still valid
	isActive := !tokenInfo.IsRevoked && time.Now().Before(tokenInfo.ExpiresAt)
	if !isActive {
		s.logger.Info("token is not active",
			slog.String("token", req.Token),
			slog.Bool("revoked", tokenInfo.IsRevoked),
			slog.Time("expires_at", tokenInfo.ExpiresAt))
		return &IntrospectionResponseDTO{Active: false}, nil
	}

	// Build the basic response
	response := &IntrospectionResponseDTO{
		Active:    true,
		Scope:     tokenInfo.Scope,
		ClientID:  tokenInfo.AppID,
		ExpiresAt: tokenInfo.ExpiresAt.Unix(),
		IssuedAt:  tokenInfo.IssuedAt.Unix(),
	}

	// Only try to fetch user info if we have a user ID
	if tokenInfo.UserID != "" && tokenInfo.UserID != "pending" {
		// Convert the user ID string to ObjectID
		userID, err := primitive.ObjectIDFromHex(tokenInfo.UserID)
		if err != nil {
			s.logger.Error("failed to parse user ID",
				slog.String("user_id", tokenInfo.UserID),
				slog.Any("error", err))
			return response, nil // Still return token info even if user lookup fails
		}

		// Fetch user information
		user, err := s.userGetByIDUseCase.Execute(ctx, userID)
		if err != nil {
			s.logger.Error("failed to fetch user",
				slog.String("user_id", tokenInfo.UserID),
				slog.Any("error", err))
			return response, nil // Still return token info even if user lookup fails
		}

		if user != nil {
			s.logger.Debug("found user",
				slog.String("user_id", user.ID.Hex()),
				slog.String("email", user.Email))
			response.UserID = user.ID.Hex()
			response.Email = user.Email
			response.FirstName = user.FirstName
			response.LastName = user.LastName
			response.Username = user.Email // Using email as username
		} else {
			s.logger.Warn("user not found",
				slog.String("user_id", tokenInfo.UserID))
		}
	} else {
		s.logger.Info("token has no associated user ID or is pending",
			slog.String("user_id", tokenInfo.UserID))
	}

	return response, nil
}
