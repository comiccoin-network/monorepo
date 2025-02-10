// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/service/oauth/callback.go
package oauth

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/config"
	dom_oauthsession "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/oauthsession"
	dom_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/user"
	uc_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/oauth"
	uc_oauthsession "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/oauthsession"
	uc_oauthstate "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/oauthstate"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/user"
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
	config                 *config.Configuration
	logger                 *slog.Logger
	exchangeCodeUseCase    uc_oauth.ExchangeCodeUseCase
	introspectTokenUseCase uc_oauth.IntrospectTokenUseCase
	getStateUseCase        uc_oauthstate.GetOAuthStateUseCase
	deleteStateUseCase     uc_oauthstate.DeleteOAuthStateUseCase
	createSessionUseCase   uc_oauthsession.CreateOAuthSessionUseCase
	userCreateUseCase      uc_user.UserCreateUseCase
	userGetByEmailUseCase  uc_user.UserGetByEmailUseCase
}

func NewCallbackService(
	config *config.Configuration,
	logger *slog.Logger,
	exchangeCodeUseCase uc_oauth.ExchangeCodeUseCase,
	introspectTokenUseCase uc_oauth.IntrospectTokenUseCase,
	getStateUseCase uc_oauthstate.GetOAuthStateUseCase,
	deleteStateUseCase uc_oauthstate.DeleteOAuthStateUseCase,
	createSessionUseCase uc_oauthsession.CreateOAuthSessionUseCase,
	userCreateUseCase uc_user.UserCreateUseCase,
	userGetByEmailUseCase uc_user.UserGetByEmailUseCase,
) CallbackService {
	return &callbackServiceImpl{
		config:                 config,
		logger:                 logger,
		exchangeCodeUseCase:    exchangeCodeUseCase,
		introspectTokenUseCase: introspectTokenUseCase,
		getStateUseCase:        getStateUseCase,
		deleteStateUseCase:     deleteStateUseCase,
		createSessionUseCase:   createSessionUseCase,
		userCreateUseCase:      userCreateUseCase,
		userGetByEmailUseCase:  userGetByEmailUseCase,
	}
}

func (s *callbackServiceImpl) Execute(ctx context.Context, req *CallbackRequest) (*CallbackResponse, error) {
	// First verify and delete state as before
	state, err := s.getStateUseCase.Execute(ctx, req.State)
	if err != nil {
		return nil, fmt.Errorf("verifying state: %w", err)
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
		return nil, fmt.Errorf("exchanging code: %w", err)
	}

	// Get user info from token introspection
	userInfo, err := s.introspectTokenUseCase.Execute(ctx, tokenResp.AccessToken)
	if err != nil {
		return nil, fmt.Errorf("getting user info: %w", err)
	}

	// Check if user exists in our system
	existingUser, err := s.userGetByEmailUseCase.Execute(ctx, userInfo.Email)
	if err != nil {
		return nil, fmt.Errorf("checking user: %w", err)
	}

	var userID primitive.ObjectID
	if existingUser == nil {
		// Create new user if they don't exist
		user := &dom_user.User{
			ID:          primitive.NewObjectID(),
			Email:       userInfo.Email,
			FirstName:   userInfo.FirstName,
			LastName:    userInfo.LastName,
			Name:        fmt.Sprintf("%s %s", userInfo.FirstName, userInfo.LastName),
			LexicalName: fmt.Sprintf("%s, %s", userInfo.LastName, userInfo.FirstName),
			Status:      dom_user.UserStatusActive,
			CreatedAt:   time.Now(),
			ModifiedAt:  time.Now(),
		}

		if err := s.userCreateUseCase.Execute(ctx, user); err != nil {
			return nil, fmt.Errorf("creating user: %w", err)
		}
		userID = user.ID
	} else {
		userID = existingUser.ID
	}

	// Create session with the correct user ID
	session := &dom_oauthsession.OAuthSession{
		ID:          primitive.NewObjectID(),
		SessionID:   primitive.NewObjectID().Hex(),
		UserID:      userID, // Now we have the correct user ID
		AccessToken: tokenResp.AccessToken,
		CreatedAt:   time.Now(),
		ExpiresAt:   tokenResp.ExpiresAt,
		LastUsedAt:  time.Now(),
	}

	if err := s.createSessionUseCase.Execute(ctx, session); err != nil {
		return nil, fmt.Errorf("creating session: %w", err)
	}

	return &CallbackResponse{
		SessionID:   session.SessionID,
		AccessToken: tokenResp.AccessToken,
		ExpiresAt:   tokenResp.ExpiresAt,
		TokenType:   tokenResp.TokenType,
	}, nil
}
