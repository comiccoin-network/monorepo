// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/service/oauth/callback.go
package oauth

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/config"
	dom_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/domain/federatedidentity"
	dom_oauthsession "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/domain/oauthsession"
	uc_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/usecase/federatedidentity"
	uc_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/usecase/oauth"
	uc_oauthsession "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/usecase/oauthsession"
	uc_oauthstate "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/usecase/oauthstate"
)

type CallbackRequest struct {
	Code  string `json:"code"`
	State string `json:"state"`
}

type CallbackResponse struct {
	SessionID           string    `json:"session_id"`
	AccessToken         string    `json:"access_token"`
	RefreshToken        string    `json:"refresh_token"`
	ExpiresAt           time.Time `json:"expires_at"`
	TokenType           string    `json:"token_type"`
	FederatedIdentityID string    `bson:"federatedidentity_id" json:"federatedidentity_id"`
}

type CallbackService interface {
	Execute(ctx context.Context, req *CallbackRequest) (*CallbackResponse, error)
}

type callbackServiceImpl struct {
	config                             *config.Configuration
	logger                             *slog.Logger
	exchangeCodeUseCase                uc_oauth.ExchangeCodeUseCase
	introspectTokenUseCase             uc_oauth.IntrospectTokenUseCase
	getStateUseCase                    uc_oauthstate.GetOAuthStateUseCase
	deleteStateUseCase                 uc_oauthstate.DeleteOAuthStateUseCase
	createSessionUseCase               uc_oauthsession.CreateOAuthSessionUseCase
	federatedidentityCreateUseCase     uc_federatedidentity.FederatedIdentityCreateUseCase
	federatedidentityGetByEmailUseCase uc_federatedidentity.FederatedIdentityGetByEmailUseCase
}

func NewCallbackService(
	config *config.Configuration,
	logger *slog.Logger,
	exchangeCodeUseCase uc_oauth.ExchangeCodeUseCase,
	introspectTokenUseCase uc_oauth.IntrospectTokenUseCase,
	getStateUseCase uc_oauthstate.GetOAuthStateUseCase,
	deleteStateUseCase uc_oauthstate.DeleteOAuthStateUseCase,
	createSessionUseCase uc_oauthsession.CreateOAuthSessionUseCase,
	federatedidentityCreateUseCase uc_federatedidentity.FederatedIdentityCreateUseCase,
	federatedidentityGetByEmailUseCase uc_federatedidentity.FederatedIdentityGetByEmailUseCase,
) CallbackService {
	return &callbackServiceImpl{
		config:                             config,
		logger:                             logger,
		exchangeCodeUseCase:                exchangeCodeUseCase,
		introspectTokenUseCase:             introspectTokenUseCase,
		getStateUseCase:                    getStateUseCase,
		deleteStateUseCase:                 deleteStateUseCase,
		createSessionUseCase:               createSessionUseCase,
		federatedidentityCreateUseCase:     federatedidentityCreateUseCase,
		federatedidentityGetByEmailUseCase: federatedidentityGetByEmailUseCase,
	}
}

func (s *callbackServiceImpl) Execute(ctx context.Context, req *CallbackRequest) (*CallbackResponse, error) {
	// First verify and delete state as before
	state, err := s.getStateUseCase.Execute(ctx, req.State)
	if err != nil {
		s.logger.Error("failed to get state",
			slog.Any("error", err))
		return nil, fmt.Errorf("verifying state: %w", err)
	}

	if state == nil {
		s.logger.Warn("failed to get state: d.n.e")
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
		s.logger.Error("failed exchanging code",
			slog.Any("error", err))
		return nil, fmt.Errorf("exchanging code: %w", err)
	}

	s.logger.Debug("successfully finished exchanging code")

	// Get federatedidentity info from token introspection
	federatedidentityInfo, err := s.introspectTokenUseCase.Execute(ctx, tokenResp.AccessToken)
	if err != nil {
		s.logger.Error("failed introspect token",
			slog.Any("error", err))
		return nil, fmt.Errorf("inspecting token error: %w", err)
	}
	if federatedidentityInfo == nil {
		s.logger.Error("failed introspect token: returned nothing")
		return nil, errors.New("failed introspect token: returned nothing")
	}

	s.logger.Debug("successfully finished running introspection",
		slog.Any("federatedIdentityInfo", federatedidentityInfo),
	)

	// Check if federatedidentity exists in our system
	existingFederatedIdentity, err := s.federatedidentityGetByEmailUseCase.Execute(ctx, federatedidentityInfo.Email)
	if err != nil {
		s.logger.Error("failed getting federatedidentity by email",
			slog.Any("error", err))
		return nil, fmt.Errorf("checking federatedidentity: %w", err)
	}

	var federatedidentityID primitive.ObjectID
	if existingFederatedIdentity == nil {
		federatedidentityID, err = primitive.ObjectIDFromHex(federatedidentityInfo.FederatedIdentityID)
		if err != nil {
			s.logger.Error("failed converting to primitive object ID",
				slog.Any("federatedidentityInfo.FederatedIdentityID", federatedidentityInfo.FederatedIdentityID),
				slog.Any("error", err))
			return nil, fmt.Errorf("converting federatedidentity ID: %w", err)
		}

		s.logger.Debug("received new federatedidentity id from gateway",
			slog.Any("federatedidentityID", federatedidentityID))

		// Create new federatedidentity if they don't exist
		federatedidentity := &dom_federatedidentity.FederatedIdentity{
			ID:          federatedidentityID,
			Email:       federatedidentityInfo.Email,
			FirstName:   federatedidentityInfo.FirstName,
			LastName:    federatedidentityInfo.LastName,
			Name:        fmt.Sprintf("%s %s", federatedidentityInfo.FirstName, federatedidentityInfo.LastName),
			LexicalName: fmt.Sprintf("%s, %s", federatedidentityInfo.LastName, federatedidentityInfo.FirstName),
			Status:      dom_federatedidentity.FederatedIdentityStatusActive,
			CreatedAt:   time.Now(),
			ModifiedAt:  time.Now(),
		}

		if err := s.federatedidentityCreateUseCase.Execute(ctx, federatedidentity); err != nil {
			s.logger.Error("failed created federatedidentity",
				slog.Any("error", err))
			return nil, fmt.Errorf("creating federatedidentity: %w", err)
		}
		s.logger.Debug("successfully stored new federatedidentity")
	} else {
		federatedidentityID = existingFederatedIdentity.ID
	}

	// Create session with the correct federatedidentity ID
	session := &dom_oauthsession.OAuthSession{
		ID:                  primitive.NewObjectID(),
		SessionID:           primitive.NewObjectID().Hex(),
		FederatedIdentityID: federatedidentityID,
		AccessToken:         tokenResp.AccessToken,
		CreatedAt:           time.Now(),
		ExpiresAt:           tokenResp.ExpiresAt,
		LastUsedAt:          time.Now(),
	}

	if err := s.createSessionUseCase.Execute(ctx, session); err != nil {
		s.logger.Error("failed created session",
			slog.Any("error", err))
		return nil, fmt.Errorf("creating session: %w", err)
	}

	return &CallbackResponse{
		SessionID:           session.SessionID,
		AccessToken:         tokenResp.AccessToken,
		RefreshToken:        tokenResp.RefreshToken,
		ExpiresAt:           tokenResp.ExpiresAt,
		TokenType:           tokenResp.TokenType,
		FederatedIdentityID: federatedidentityID.Hex(),
	}, nil
}
