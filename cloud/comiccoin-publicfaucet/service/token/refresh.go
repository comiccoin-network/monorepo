// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/service/token/refresh.go
package token

import (
	"context"
	"errors"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/config"
	dom_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/domain/token"
	uc_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/usecase/oauth"
	uc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/usecase/token"
)

type RefreshRequest struct {
	UserID       primitive.ObjectID `json:"user_id"`
	RefreshToken string             `json:"refresh_token"`
}

type RefreshResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	TokenType    string `json:"token_type"`
	ExpiresIn    int    `json:"expires_in"`
}

type RefreshTokenService interface {
	RefreshToken(ctx context.Context, req *RefreshRequest) (*RefreshResponse, error)
}

type refreshTokenServiceImpl struct {
	config              *config.Configuration
	logger              *slog.Logger
	refreshTokenUseCase uc_oauth.RefreshTokenUseCase
	tokenGetUseCase     uc_token.TokenGetByUserIDUseCase
	tokenUpsertUseCase  uc_token.TokenUpsertByUserIDUseCase
}

func NewRefreshTokenService(
	config *config.Configuration,
	logger *slog.Logger,
	refreshTokenUseCase uc_oauth.RefreshTokenUseCase,
	tokenGetUseCase uc_token.TokenGetByUserIDUseCase,
	tokenUpsertUseCase uc_token.TokenUpsertByUserIDUseCase,
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
	// Validate request
	if req.UserID.IsZero() {
		return nil, errors.New("user_id is required")
	}
	if req.RefreshToken == "" {
		return nil, errors.New("refresh_token is required")
	}

	// Get existing token to verify the refresh token belongs to the user
	existingToken, err := s.tokenGetUseCase.Execute(ctx, req.UserID)
	if err != nil {
		s.logger.Error("failed to get existing token",
			slog.Any("user_id", req.UserID),
			slog.Any("error", err))
		return nil, err
	}

	if existingToken.RefreshToken != req.RefreshToken {
		s.logger.Warn("refresh token mismatch",
			slog.Any("user_id", req.UserID))
		return nil, errors.New("invalid refresh token")
	}

	// Refresh the token with OAuth server
	tokenResp, err := s.refreshTokenUseCase.Execute(ctx, req.RefreshToken)
	if err != nil {
		s.logger.Error("failed to refresh token with OAuth server",
			slog.Any("user_id", req.UserID),
			slog.Any("error", err))
		return nil, err
	}

	// Update token in storage
	token := &dom_token.Token{
		UserID:       req.UserID,
		AccessToken:  tokenResp.AccessToken,
		RefreshToken: tokenResp.RefreshToken,
		ExpiresAt:    tokenResp.ExpiresAt,
	}

	err = s.tokenUpsertUseCase.Execute(ctx, token)
	if err != nil {
		s.logger.Error("failed to update token in storage",
			slog.Any("user_id", req.UserID),
			slog.Any("error", err))
		return nil, err
	}

	s.logger.Info("token refreshed successfully",
		slog.Any("user_id", req.UserID))

	return &RefreshResponse{
		AccessToken:  tokenResp.AccessToken,
		RefreshToken: tokenResp.RefreshToken,
		TokenType:    tokenResp.TokenType,
		ExpiresIn:    tokenResp.ExpiresIn,
	}, nil
}
