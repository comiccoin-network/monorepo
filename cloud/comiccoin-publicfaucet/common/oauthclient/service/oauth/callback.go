// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/service/oauth/callback.go
package oauth

import (
	"context"
	"errors"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/config"
	dom_oauthsession "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/oauthsession"
	uc_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/oauth"
	uc_oauthsession "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/oauthsession"
	uc_oauthstate "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/oauthstate"
)

type CallbackRequest struct {
	Code  string `json:"code"`
	State string `json:"state"`
}

type CallbackResponse struct {
	SessionID   string    `json:"session_id"`
	AccessToken string    `json:"access_token"`
	ExpiresAt   time.Time `json:"expires_at"`
	TokenType   string    `json:"token_type"`
}

type CallbackService interface {
	Execute(ctx context.Context, req *CallbackRequest) (*CallbackResponse, error)
}

type callbackServiceImpl struct {
	config               *config.Configuration
	logger               *slog.Logger
	exchangeCodeUseCase  uc_oauth.ExchangeCodeUseCase
	getStateUseCase      uc_oauthstate.GetOAuthStateUseCase
	deleteStateUseCase   uc_oauthstate.DeleteOAuthStateUseCase
	createSessionUseCase uc_oauthsession.CreateOAuthSessionUseCase
}

func NewCallbackService(
	config *config.Configuration,
	logger *slog.Logger,
	exchangeCodeUseCase uc_oauth.ExchangeCodeUseCase,
	getStateUseCase uc_oauthstate.GetOAuthStateUseCase,
	deleteStateUseCase uc_oauthstate.DeleteOAuthStateUseCase,
	createSessionUseCase uc_oauthsession.CreateOAuthSessionUseCase,
) CallbackService {
	return &callbackServiceImpl{
		config:               config,
		logger:               logger,
		exchangeCodeUseCase:  exchangeCodeUseCase,
		getStateUseCase:      getStateUseCase,
		deleteStateUseCase:   deleteStateUseCase,
		createSessionUseCase: createSessionUseCase,
	}
}

func (s *callbackServiceImpl) Execute(ctx context.Context, req *CallbackRequest) (*CallbackResponse, error) {
	// Verify state
	state, err := s.getStateUseCase.Execute(ctx, req.State)
	if err != nil {
		s.logger.Error("failed to get state",
			slog.String("state", req.State),
			slog.Any("error", err))
		return nil, err
	}

	if state == nil {
		return nil, errors.New("invalid state")
	}

	// Delete the used state immediately
	err = s.deleteStateUseCase.Execute(ctx, req.State)
	if err != nil {
		s.logger.Error("failed to delete state",
			slog.String("state", req.State),
			slog.Any("error", err))
		// Continue processing as this is not critical
	}

	// Exchange code for token
	tokenResp, err := s.exchangeCodeUseCase.Execute(ctx, req.Code)
	if err != nil {
		s.logger.Error("failed to exchange code for token",
			slog.Any("error", err))
		return nil, err
	}

	// Create a new session
	session := &dom_oauthsession.OAuthSession{
		ID:          primitive.NewObjectID(),
		SessionID:   primitive.NewObjectID().Hex(), // Generate a unique session ID
		UserID:      primitive.NewObjectID(),       // This should come from the token claims in a real implementation
		AccessToken: tokenResp.AccessToken,
		CreatedAt:   time.Now(),
		ExpiresAt:   tokenResp.ExpiresAt,
		LastUsedAt:  time.Now(),
	}

	err = s.createSessionUseCase.Execute(ctx, session)
	if err != nil {
		s.logger.Error("failed to create session",
			slog.Any("error", err))
		return nil, err
	}

	return &CallbackResponse{
		SessionID:   session.SessionID,
		AccessToken: tokenResp.AccessToken,
		ExpiresAt:   tokenResp.ExpiresAt,
		TokenType:   tokenResp.TokenType,
	}, nil
}
