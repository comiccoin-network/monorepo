// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/service/oauth/sessioninfo.go
package oauth

import (
	"context"
	"errors"
	"log/slog"
	"time"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/config"
	dom_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/domain/user"
	uc_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/usecase/oauth"
	uc_oauthsession "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/usecase/oauthsession"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/usecase/user"
)

type OAuthSessionInfoRequest struct {
	SessionID string `json:"session_id"`
}

type OAuthSessionInfoResponse struct {
	Valid       bool           `json:"valid"`
	User        *dom_user.User `json:"user,omitempty"`
	ExpiresAt   time.Time      `json:"expires_at,omitempty"`
	LastUsedAt  time.Time      `json:"last_used_at,omitempty"`
	RequiresOTP bool           `json:"requires_otp"`
}

type OAuthSessionInfoService interface {
	GetSessionInfo(ctx context.Context, req *OAuthSessionInfoRequest) (*OAuthSessionInfoResponse, error)
}

type sessionInfoServiceImpl struct {
	config                 *config.Configuration
	logger                 *slog.Logger
	getOAuthSessionUseCase uc_oauthsession.GetOAuthSessionUseCase
	getUserByIDUseCase     uc_user.UserGetByIDUseCase
	introspectTokenUseCase uc_oauth.IntrospectTokenUseCase
}

func NewOAuthSessionInfoService(
	config *config.Configuration,
	logger *slog.Logger,
	getOAuthSessionUseCase uc_oauthsession.GetOAuthSessionUseCase,
	getUserByIDUseCase uc_user.UserGetByIDUseCase,
	introspectTokenUseCase uc_oauth.IntrospectTokenUseCase,
) OAuthSessionInfoService {
	return &sessionInfoServiceImpl{
		config:                 config,
		logger:                 logger,
		getOAuthSessionUseCase: getOAuthSessionUseCase,
		getUserByIDUseCase:     getUserByIDUseCase,
		introspectTokenUseCase: introspectTokenUseCase,
	}
}

func (s *sessionInfoServiceImpl) GetSessionInfo(ctx context.Context, req *OAuthSessionInfoRequest) (*OAuthSessionInfoResponse, error) {
	if req.SessionID == "" {
		return nil, errors.New("session_id is required")
	}

	// Get session
	session, err := s.getOAuthSessionUseCase.Execute(ctx, req.SessionID)
	if err != nil {
		s.logger.Error("failed to get session",
			slog.String("session_id", req.SessionID),
			slog.Any("error", err))
		return nil, err
	}

	if session == nil {
		return &OAuthSessionInfoResponse{
			Valid: false,
		}, nil
	}

	// Check if session has expired
	if time.Now().After(session.ExpiresAt) {
		return &OAuthSessionInfoResponse{
			Valid: false,
		}, nil
	}

	// Validate token with OAuth server
	tokenInfo, err := s.introspectTokenUseCase.Execute(ctx, session.AccessToken)
	if err != nil {
		s.logger.Error("failed to introspect token",
			slog.String("session_id", req.SessionID),
			slog.Any("error", err))
		return nil, err
	}

	if !tokenInfo.Active {
		return &OAuthSessionInfoResponse{
			Valid: false,
		}, nil
	}

	// Get user details
	user, err := s.getUserByIDUseCase.Execute(ctx, session.UserID)
	if err != nil {
		s.logger.Error("failed to get user",
			slog.Any("user_id", session.UserID),
			slog.Any("error", err))
		return nil, err
	}

	return &OAuthSessionInfoResponse{
		Valid:       true,
		User:        user,
		ExpiresAt:   session.ExpiresAt,
		LastUsedAt:  session.LastUsedAt,
		RequiresOTP: user.OTPEnabled && !user.OTPValidated,
	}, nil
}
