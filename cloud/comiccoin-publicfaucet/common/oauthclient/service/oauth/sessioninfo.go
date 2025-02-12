// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/service/oauth/sessioninfo.go
package oauth

import (
	"context"
	"errors"
	"log/slog"
	"time"

	uc_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/oauth"
	uc_oauthsession "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/oauthsession"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/config"
	dom_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/federatedidentity"
	uc_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/federatedidentity"
)

type OAuthSessionInfoRequest struct {
	SessionID string `json:"session_id"`
}

type OAuthSessionInfoResponse struct {
	Valid       bool           `json:"valid"`
	FederatedIdentity        *dom_federatedidentity.FederatedIdentity `json:"federatedidentity,omitempty"`
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
	getFederatedIdentityByIDUseCase     uc_federatedidentity.FederatedIdentityGetByIDUseCase
	introspectTokenUseCase uc_oauth.IntrospectTokenUseCase
}

func NewOAuthSessionInfoService(
	config *config.Configuration,
	logger *slog.Logger,
	getOAuthSessionUseCase uc_oauthsession.GetOAuthSessionUseCase,
	getFederatedIdentityByIDUseCase uc_federatedidentity.FederatedIdentityGetByIDUseCase,
	introspectTokenUseCase uc_oauth.IntrospectTokenUseCase,
) OAuthSessionInfoService {
	return &sessionInfoServiceImpl{
		config:                 config,
		logger:                 logger,
		getOAuthSessionUseCase: getOAuthSessionUseCase,
		getFederatedIdentityByIDUseCase:     getFederatedIdentityByIDUseCase,
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

	// Get federatedidentity details
	federatedidentity, err := s.getFederatedIdentityByIDUseCase.Execute(ctx, session.FederatedIdentityID)
	if err != nil {
		s.logger.Error("failed to get federatedidentity",
			slog.Any("federatedidentity_id", session.FederatedIdentityID),
			slog.Any("error", err))
		return nil, err
	}

	return &OAuthSessionInfoResponse{
		Valid:       true,
		FederatedIdentity:        federatedidentity,
		ExpiresAt:   session.ExpiresAt,
		LastUsedAt:  session.LastUsedAt,
		RequiresOTP: federatedidentity.OTPEnabled && !federatedidentity.OTPValidated,
	}, nil
}
