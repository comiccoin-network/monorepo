// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/service/oauth/tokenmanager.go
package oauth

import (
	"context"
	"fmt"
	"log/slog"
	"sync"
	"time"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/token"
	dom_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/token"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/oauth"
	uc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/token"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// TokenManagerService handles token management operations including caching and refreshing
type TokenManagerService struct {
	config              *config.Configuration
	logger              *slog.Logger
	getTokenUseCase     uc_token.TokenGetByUserIDUseCase
	upsertTokenUseCase  uc_token.TokenUpsertByUserIDUseCase
	refreshTokenUseCase oauth.RefreshTokenUseCase

	// For coordinating refreshes across goroutines
	refreshMutex sync.Map
}

// NewTokenManagerService creates a new instance of TokenManagerService
func NewTokenManagerService(
	config *config.Configuration,
	logger *slog.Logger,
	getTokenUseCase uc_token.TokenGetByUserIDUseCase,
	upsertTokenUseCase uc_token.TokenUpsertByUserIDUseCase,
	refreshTokenUseCase oauth.RefreshTokenUseCase,
) *TokenManagerService {
	return &TokenManagerService{
		config:              config,
		logger:              logger,
		getTokenUseCase:     getTokenUseCase,
		upsertTokenUseCase:  upsertTokenUseCase,
		refreshTokenUseCase: refreshTokenUseCase,
	}
}

// GetValidToken retrieves a valid token for the given user ID, refreshing if necessary
func (s *TokenManagerService) GetValidToken(ctx context.Context, userID primitive.ObjectID) (*dom_token.Token, error) {
	// First try to get token from database
	currentToken, err := s.getTokenUseCase.Execute(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("getting token: %w", err)
	}

	// Check if token needs refresh (if it expires in next 5 minutes)
	if time.Now().Add(5 * time.Minute).After(currentToken.ExpiresAt) {
		// Use mutex to prevent multiple simultaneous refreshes
		mutexKey := userID.Hex()
		actual, _ := s.refreshMutex.LoadOrStore(mutexKey, &sync.Mutex{})
		mutex := actual.(*sync.Mutex)

		mutex.Lock()
		defer mutex.Unlock()

		// Double-check after acquiring lock
		currentToken, err = s.getTokenUseCase.Execute(ctx, userID)
		if err != nil {
			return nil, fmt.Errorf("getting token after lock: %w", err)
		}

		if time.Now().Add(5 * time.Minute).After(currentToken.ExpiresAt) {
			// Refresh the token
			tokenResponse, err := s.refreshTokenUseCase.Execute(ctx, currentToken.RefreshToken)
			if err != nil {
				return nil, fmt.Errorf("refreshing token: %w", err)
			}

			// Create new token with refreshed values
			newToken := &token.Token{
				ID:           currentToken.ID,
				UserID:       userID,
				AccessToken:  tokenResponse.AccessToken,
				RefreshToken: tokenResponse.RefreshToken,
				ExpiresAt:    tokenResponse.ExpiresAt,
			}

			// Update token in database
			if err := s.upsertTokenUseCase.Execute(ctx, newToken); err != nil {
				return nil, fmt.Errorf("updating refreshed token: %w", err)
			}

			currentToken = newToken
		}
	}

	return currentToken, nil
}
