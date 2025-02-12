// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/service/oauth/refresh.go
package oauth

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"log/slog"
	"time"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/config"
	dom_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/domain/token"
	uc_app "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/usecase/application"
	uc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/usecase/token"
)

// RefreshTokenRequestDTO represents the input data for refreshing tokens
type RefreshTokenRequestDTO struct {
	GrantType    string
	RefreshToken string
	ClientID     string
	ClientSecret string
}

// RefreshTokenResponseDTO represents the response after refreshing tokens
type RefreshTokenResponseDTO struct {
	AccessToken  string `json:"access_token"`
	TokenType    string `json:"token_type"`
	ExpiresIn    int    `json:"expires_in"`
	RefreshToken string `json:"refresh_token"`
	Scope        string `json:"scope,omitempty"`
}

type RefreshTokenService interface {
	RefreshToken(ctx context.Context, req *RefreshTokenRequestDTO) (*RefreshTokenResponseDTO, error)
}

type refreshTokenServiceImpl struct {
	cfg    *config.Configuration
	logger *slog.Logger

	appValidateCredentialsUseCase uc_app.ApplicationValidateCredentialsUseCase
	tokenFindByIDUseCase          uc_token.TokenFindByIDUseCase
	tokenStoreUseCase             uc_token.TokenStoreUseCase
	tokenRevokeUseCase            uc_token.TokenRevokeUseCase
}

func NewRefreshTokenService(
	cfg *config.Configuration,
	logger *slog.Logger,
	appValidateCredentialsUseCase uc_app.ApplicationValidateCredentialsUseCase,
	tokenFindByIDUseCase uc_token.TokenFindByIDUseCase,
	tokenStoreUseCase uc_token.TokenStoreUseCase,
	tokenRevokeUseCase uc_token.TokenRevokeUseCase,
) RefreshTokenService {
	return &refreshTokenServiceImpl{
		cfg:                           cfg,
		logger:                        logger,
		appValidateCredentialsUseCase: appValidateCredentialsUseCase,
		tokenFindByIDUseCase:          tokenFindByIDUseCase,
		tokenStoreUseCase:             tokenStoreUseCase,
		tokenRevokeUseCase:            tokenRevokeUseCase,
	}
}

func generateToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", fmt.Errorf("failed to generate token: %w", err)
	}
	return base64.URLEncoding.EncodeToString(b)[:32], nil
}

func (s *refreshTokenServiceImpl) RefreshToken(ctx context.Context, req *RefreshTokenRequestDTO) (*RefreshTokenResponseDTO, error) {
	// Add debug logging
	s.logger.Debug("processing refresh token request",
		slog.String("client_id", req.ClientID),
		slog.String("grant_type", req.GrantType),
		slog.String("refresh_token", req.RefreshToken[:5]+"...")) // Log only part of the token for security

	// Validate grant type
	if req.GrantType != "refresh_token" {
		s.logger.Warn("invalid grant type",
			slog.String("received_grant_type", req.GrantType))
		return nil, fmt.Errorf("invalid grant type")
	}

	// Validate client credentials with detailed logging
	valid, err := s.appValidateCredentialsUseCase.Execute(ctx, req.ClientID, req.ClientSecret)
	if err != nil || !valid {
		s.logger.Warn("invalid client credentials",
			slog.String("client_id", req.ClientID),
			slog.Bool("valid", valid),
			slog.Any("error", err))
		return nil, fmt.Errorf("invalid client credentials")
	}

	// Get the existing refresh token with detailed error handling
	existingToken, err := s.tokenFindByIDUseCase.Execute(ctx, req.RefreshToken)
	if err != nil {
		switch {
		case errors.Is(err, dom_token.ErrTokenNotFound):
			s.logger.Warn("refresh token not found",
				slog.String("refresh_token", req.RefreshToken[:5]+"..."))
			return nil, fmt.Errorf("refresh token not found")
		case errors.Is(err, dom_token.ErrTokenExpired):
			s.logger.Warn("refresh token expired",
				slog.String("refresh_token", req.RefreshToken[:5]+"..."))
			return nil, fmt.Errorf("refresh token expired")
		case errors.Is(err, dom_token.ErrTokenRevoked):
			s.logger.Warn("refresh token revoked",
				slog.String("refresh_token", req.RefreshToken[:5]+"..."))
			return nil, fmt.Errorf("refresh token revoked")
		default:
			s.logger.Error("failed to find refresh token",
				slog.String("refresh_token", req.RefreshToken[:5]+"..."),
				slog.Any("error", err))
			return nil, fmt.Errorf("invalid refresh token: %w", err)
		}
	}

	if existingToken == nil {
		s.logger.Warn("refresh token not found",
			slog.String("refresh_token", req.RefreshToken[:5]+"..."))
		return nil, fmt.Errorf("refresh token not found")
	}

	// Verify token belongs to this client
	if existingToken.AppID != req.ClientID {
		s.logger.Warn("refresh token belongs to different client",
			slog.String("token_client", existingToken.AppID),
			slog.String("request_client", req.ClientID))
		return nil, fmt.Errorf("invalid refresh token")
	}

	// Generate new tokens
	newAccessToken, err := generateToken()
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token: %w", err)
	}

	newRefreshToken, err := generateToken()
	if err != nil {
		return nil, fmt.Errorf("failed to generate refresh token: %w", err)
	}

	// Create and store new access token
	accessToken := &dom_token.Token{
		TokenID:             newAccessToken,
		TokenType:           "access",
		FederatedIdentityID: existingToken.FederatedIdentityID,
		AppID:               req.ClientID,
		Scope:               existingToken.Scope,
		ExpiresAt:           time.Now().Add(1 * time.Hour),
		IssuedAt:            time.Now(),
		LastUsedAt:          time.Now(),
	}

	if err := s.tokenStoreUseCase.Execute(ctx, accessToken); err != nil {
		return nil, fmt.Errorf("failed to store access token: %w", err)
	}

	// Create and store new refresh token
	refreshToken := &dom_token.Token{
		TokenID:             newRefreshToken,
		TokenType:           "refresh",
		FederatedIdentityID: existingToken.FederatedIdentityID,
		AppID:               req.ClientID,
		Scope:               existingToken.Scope,
		ExpiresAt:           time.Now().Add(30 * 24 * time.Hour),
		IssuedAt:            time.Now(),
		LastUsedAt:          time.Now(),
	}

	if err := s.tokenStoreUseCase.Execute(ctx, refreshToken); err != nil {
		return nil, fmt.Errorf("failed to store refresh token: %w", err)
	}

	// Revoke the old refresh token
	if err := s.tokenRevokeUseCase.Execute(ctx, req.RefreshToken); err != nil {
		s.logger.Error("failed to revoke old refresh token",
			"error", err,
			"token_id", req.RefreshToken)
		// Continue despite error
	}

	return &RefreshTokenResponseDTO{
		AccessToken:  newAccessToken,
		TokenType:    "Bearer",
		ExpiresIn:    3600,
		RefreshToken: newRefreshToken,
		Scope:        existingToken.Scope,
	}, nil
}
