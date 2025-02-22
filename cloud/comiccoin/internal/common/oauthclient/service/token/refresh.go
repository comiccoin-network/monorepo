// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/service/token/refresh.go
package token

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/config"
	dom_token "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/domain/token"
	uc_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/usecase/oauth"
	uc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/usecase/token"
)

type RefreshRequest struct {
	FederatedIdentityID primitive.ObjectID `json:"federatedidentity_id"`
	RefreshToken        string             `json:"refresh_token"`
}

type RefreshResponse struct {
	AccessToken         string             `json:"access_token"`
	FederatedIdentityID primitive.ObjectID `json:"federatedidentity_id"`
	RefreshToken        string             `json:"refresh_token"`
	TokenType           string             `json:"token_type"`
	ExpiresIn           int                `json:"expires_in"`
}

type RefreshTokenService interface {
	RefreshToken(ctx context.Context, req *RefreshRequest) (*RefreshResponse, error)
}

type refreshTokenServiceImpl struct {
	config              *config.Configuration
	logger              *slog.Logger
	refreshTokenUseCase uc_oauth.RefreshTokenUseCase
	tokenGetUseCase     uc_token.TokenGetByFederatedIdentityIDUseCase
	tokenUpsertUseCase  uc_token.TokenUpsertByFederatedIdentityIDUseCase
}

func NewRefreshTokenService(
	config *config.Configuration,
	logger *slog.Logger,
	refreshTokenUseCase uc_oauth.RefreshTokenUseCase,
	tokenGetUseCase uc_token.TokenGetByFederatedIdentityIDUseCase,
	tokenUpsertUseCase uc_token.TokenUpsertByFederatedIdentityIDUseCase,
) RefreshTokenService {
	return &refreshTokenServiceImpl{
		config:              config,
		logger:              logger,
		refreshTokenUseCase: refreshTokenUseCase,
		tokenGetUseCase:     tokenGetUseCase,
		tokenUpsertUseCase:  tokenUpsertUseCase,
	}
}

func (s *refreshTokenServiceImpl) RefreshToken(ctx context.Context, req *RefreshRequest) (*RefreshResponse, error) {
	if req.FederatedIdentityID.IsZero() {
		return nil, errors.New("federatedidentity_id is required")
	}
	if req.RefreshToken == "" {
		return nil, errors.New("refresh_token is required")
	}

	// First, let's try to refresh the token with the OAuth server
	tokenResp, err := s.refreshTokenUseCase.Execute(ctx, req.RefreshToken)
	if err != nil {
		s.logger.Error("failed to refresh token with OAuth server",
			slog.Any("error", err))
		return nil, fmt.Errorf("refreshing token with OAuth server: %w", err)
	}

	// Verify we got a valid response
	if tokenResp == nil {
		return nil, errors.New("received nil token response from OAuth server")
	}

	// Add debug logging to see what we received
	s.logger.Debug("received token response from OAuth server",
		slog.String("federatedidentity_id", req.FederatedIdentityID.Hex()),
		slog.String("token_type", tokenResp.TokenType),
		slog.Int("expires_in", tokenResp.ExpiresIn),
		slog.Time("expires_at", tokenResp.ExpiresAt),
		slog.Bool("has_access_token", tokenResp.AccessToken != ""),
		slog.Bool("has_refresh_token", tokenResp.RefreshToken != ""))

	// Create our domain token with the refreshed values
	token := &dom_token.Token{
		ID:                  primitive.NewObjectID(),
		FederatedIdentityID: req.FederatedIdentityID,
		AccessToken:         tokenResp.AccessToken,
		RefreshToken:        tokenResp.RefreshToken,
		ExpiresAt:           time.Now().Add(time.Duration(tokenResp.ExpiresIn) * time.Second), // Calculate expiry from ExpiresIn
	}

	// Get existing token to preserve ID if it exists
	existingToken, err := s.tokenGetUseCase.Execute(ctx, req.FederatedIdentityID)
	if err == nil && existingToken != nil {
		token.ID = existingToken.ID
	}

	// Validate the token we're about to store
	if token.AccessToken == "" {
		return nil, errors.New("OAuth server returned empty access token")
	}
	if token.RefreshToken == "" {
		return nil, errors.New("OAuth server returned empty refresh token")
	}
	if token.ExpiresAt.Before(time.Now()) {
		return nil, errors.New("OAuth server returned invalid expiration time")
	}

	// Store the refreshed token
	err = s.tokenUpsertUseCase.Execute(ctx, token)
	if err != nil {
		s.logger.Error("failed to update token in storage",
			slog.Any("error", err))
		return nil, fmt.Errorf("storing refreshed token: %w", err)
	}

	s.logger.Info("token refreshed successfully")

	return &RefreshResponse{
		FederatedIdentityID: req.FederatedIdentityID,
		AccessToken:         token.AccessToken,
		RefreshToken:        token.RefreshToken,
		TokenType:           tokenResp.TokenType,
		ExpiresIn:           tokenResp.ExpiresIn,
	}, nil
}
