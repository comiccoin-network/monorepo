// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/service/introspection/service.go
package introspection

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/config"
	uc_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/usecase/federatedidentity"
	uc_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/usecase/oauth"
	uc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/usecase/token"
)

// We define custom error types to differentiate between expiration scenarios
type TokenExpiredError struct {
	Message string
}

func (e *TokenExpiredError) Error() string {
	return e.Message
}

type SessionExpiredError struct {
	Message string
}

func (e *SessionExpiredError) Error() string {
	return e.Message
}

// Request/Response types remain the same
type IntrospectionRequest struct {
	Token               string
	FederatedIdentityID string // Optional - if provided, we verify token ownership
}

type IntrospectionResponse struct {
	Active              bool               `json:"active"`
	FederatedIdentityID primitive.ObjectID `json:"federatedidentity_id,omitempty"`
	Email               string             `json:"email,omitempty"`
	FirstName           string             `json:"first_name,omitempty"`
	LastName            string             `json:"last_name,omitempty"`
}

// Service interface remains the same
type IntrospectionService interface {
	IntrospectToken(ctx context.Context, req *IntrospectionRequest) (*IntrospectionResponse, error)
}

// Service implementation with simplified dependencies
type introspectionServiceImpl struct {
	config                          *config.Configuration
	logger                          *slog.Logger
	introspectTokenUseCase          uc_oauth.IntrospectTokenUseCase
	tokenGetUseCase                 uc_token.TokenGetByFederatedIdentityIDUseCase
	federatedidentityGetByIDUseCase uc_federatedidentity.FederatedIdentityGetByIDUseCase
}

func NewIntrospectionService(
	cfg *config.Configuration,
	logger *slog.Logger,
	introspectTokenUseCase uc_oauth.IntrospectTokenUseCase,
	tokenGetUseCase uc_token.TokenGetByFederatedIdentityIDUseCase,
	federatedidentityGetByIDUseCase uc_federatedidentity.FederatedIdentityGetByIDUseCase,
) IntrospectionService {
	return &introspectionServiceImpl{
		config:                          cfg,
		logger:                          logger,
		introspectTokenUseCase:          introspectTokenUseCase,
		tokenGetUseCase:                 tokenGetUseCase,
		federatedidentityGetByIDUseCase: federatedidentityGetByIDUseCase,
	}
}

func (s *introspectionServiceImpl) IntrospectToken(ctx context.Context, req *IntrospectionRequest) (*IntrospectionResponse, error) {
	// If federatedidentity ID is provided, verify token ownership and check expiration
	if req.FederatedIdentityID != "" {
		federatedidentityID, err := primitive.ObjectIDFromHex(req.FederatedIdentityID)
		if err != nil {
			return nil, httperror.NewForBadRequest(&map[string]string{
				"federatedidentity_id": "invalid format",
			})
		}

		// Get stored token to check expiration
		storedToken, err := s.tokenGetUseCase.Execute(ctx, federatedidentityID)
		if err != nil {
			return nil, fmt.Errorf("getting stored token: %w", err)
		}
		if storedToken == nil {
			s.logger.Error("no stored token found", slog.String("federatedidentity_id", req.FederatedIdentityID))
			return nil, &SessionExpiredError{Message: "No active session found. Please log in again."}
		}

		// Check for token expiration scenarios
		now := time.Now()

		// Both access token and refresh token are expired (session expired)
		if now.After(storedToken.ExpiresAt) && now.After(storedToken.ExpiresAt.Add(30*24*time.Hour)) {
			s.logger.Info("session expired, requires new login",
				slog.String("federatedidentity_id", req.FederatedIdentityID))
			return nil, &SessionExpiredError{
				Message: "Your session has expired. Please log in again to continue.",
			}
		}

		// Only access token is expired (needs refresh)
		if now.After(storedToken.ExpiresAt) {
			s.logger.Info("access token expired, requires refresh",
				slog.String("federatedidentity_id", req.FederatedIdentityID))
			return nil, &TokenExpiredError{
				Message: "Access token has expired. Please refresh your token to continue.",
			}
		}

		// Use the valid token for introspection
		req.Token = storedToken.AccessToken
	}

	// Proceed with introspection for valid tokens
	introspectResp, err := s.introspectTokenUseCase.Execute(ctx, req.Token)
	if err != nil {
		return nil, fmt.Errorf("introspecting token: %w", err)
	}

	// Verify client ID
	if introspectResp.ClientID != s.config.OAuth.ClientID {
		s.logger.Warn("client ID mismatch",
			slog.String("expected", s.config.OAuth.ClientID),
			slog.String("received", introspectResp.ClientID))
		return &IntrospectionResponse{Active: false}, nil
	}

	if !introspectResp.Active {
		return &IntrospectionResponse{Active: false}, nil
	}

	// Fetch federatedidentity information for active tokens
	if introspectResp.FederatedIdentityID != "" {
		federatedidentityID, err := primitive.ObjectIDFromHex(introspectResp.FederatedIdentityID)
		if err != nil {
			return nil, httperror.NewForBadRequest(&map[string]string{
				"federatedidentity_id": "invalid format from introspection",
			})
		}

		federatedidentity, err := s.federatedidentityGetByIDUseCase.Execute(ctx, federatedidentityID)
		if err != nil {
			return nil, fmt.Errorf("getting federatedidentity info: %w", err)
		}
		if federatedidentity == nil {
			return nil, fmt.Errorf("federatedidentity d.n.e. for: %v", introspectResp.FederatedIdentityID)
		}

		return &IntrospectionResponse{
			Active:              true,
			FederatedIdentityID: federatedidentity.ID,
			Email:               federatedidentity.Email,
			FirstName:           federatedidentity.FirstName,
			LastName:            federatedidentity.LastName,
		}, nil
	}

	return &IntrospectionResponse{Active: true}, nil
}
