// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/service/oauth/exchange.go
package oauth

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/config"
	dom_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/token"
	dom_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/user"
	uc_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/oauth"
	uc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/token"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/user"
)

type ExchangeTokenRequest struct {
	Code string
}

type ExchangeTokenResponse struct {
	AccessToken  string
	RefreshToken string
	TokenType    string
	ExpiresIn    int
	UserEmail    string
	FirstName    string
	LastName     string
}

type ExchangeService interface {
	ExchangeToken(ctx context.Context, req *ExchangeTokenRequest) (*ExchangeTokenResponse, error)
}

type exchangeServiceImpl struct {
	config                 *config.Configuration
	logger                 *slog.Logger
	exchangeCodeUseCase    uc_oauth.ExchangeCodeUseCase
	introspectTokenUseCase uc_oauth.IntrospectTokenUseCase
	userCreateUseCase      uc_user.UserCreateUseCase
	userGetByEmailUseCase  uc_user.UserGetByEmailUseCase
	tokenUpsertUseCase     uc_token.TokenUpsertByUserIDUseCase
}

func NewExchangeService(
	config *config.Configuration,
	logger *slog.Logger,
	exchangeCodeUseCase uc_oauth.ExchangeCodeUseCase,
	introspectTokenUseCase uc_oauth.IntrospectTokenUseCase,
	userCreateUseCase uc_user.UserCreateUseCase,
	userGetByEmailUseCase uc_user.UserGetByEmailUseCase,
	tokenUpsertUseCase uc_token.TokenUpsertByUserIDUseCase,
) ExchangeService {
	return &exchangeServiceImpl{
		config:                 config,
		logger:                 logger,
		exchangeCodeUseCase:    exchangeCodeUseCase,
		introspectTokenUseCase: introspectTokenUseCase,
		userCreateUseCase:      userCreateUseCase,
		userGetByEmailUseCase:  userGetByEmailUseCase,
		tokenUpsertUseCase:     tokenUpsertUseCase,
	}
}

func (s *exchangeServiceImpl) ExchangeToken(ctx context.Context, req *ExchangeTokenRequest) (*ExchangeTokenResponse, error) {
	// First exchange code for token as before
	tokenResp, err := s.exchangeCodeUseCase.Execute(ctx, req.Code)
	if err != nil {
		return nil, fmt.Errorf("exchanging code: %w", err)
	}

	// Get user info through introspection
	userInfo, err := s.introspectTokenUseCase.Execute(ctx, tokenResp.AccessToken)
	if err != nil {
		return nil, fmt.Errorf("getting user info: %w", err)
	}

	// Convert user ID from introspection response
	userID, err := primitive.ObjectIDFromHex(userInfo.UserID)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID format: %w", err)
	}

	// Check if user exists in our system
	existingUser, err := s.userGetByEmailUseCase.Execute(ctx, userInfo.Email)
	if err != nil {
		return nil, fmt.Errorf("checking user: %w", err)
	}

	var finalUserID primitive.ObjectID
	if existingUser == nil {
		// Create new user if they don't exist
		newUser := &dom_user.User{
			ID:          userID, // Use the ID from introspection
			Email:       userInfo.Email,
			FirstName:   userInfo.FirstName,
			LastName:    userInfo.LastName,
			Name:        fmt.Sprintf("%s %s", userInfo.FirstName, userInfo.LastName),
			LexicalName: fmt.Sprintf("%s, %s", userInfo.LastName, userInfo.FirstName),
			Status:      dom_user.UserStatusActive,
			CreatedAt:   time.Now(),
			ModifiedAt:  time.Now(),
		}

		if err := s.userCreateUseCase.Execute(ctx, newUser); err != nil {
			return nil, fmt.Errorf("creating user: %w", err)
		}
		finalUserID = newUser.ID
	} else {
		finalUserID = existingUser.ID
	}

	// Create and store token
	token := &dom_token.Token{
		ID:           primitive.NewObjectID(),
		UserID:       finalUserID,
		AccessToken:  tokenResp.AccessToken,
		RefreshToken: tokenResp.RefreshToken,
		ExpiresAt:    tokenResp.ExpiresAt,
	}

	s.logger.Info("storing new access and refresh token",
		slog.String("token_id", token.ID.Hex()[:5]+"..."),
		slog.String("user_id", token.UserID.Hex()),
		slog.Time("expires_at", token.ExpiresAt))

	// Store token using token upsert use case
	if err := s.tokenUpsertUseCase.Execute(ctx, token); err != nil {
		return nil, fmt.Errorf("storing token: %w", err)
	}

	s.logger.Info("successfully stored access and refresh token",
		slog.String("token_id", token.ID.Hex()[:5]+"..."))

	return &ExchangeTokenResponse{
		AccessToken:  tokenResp.AccessToken,
		RefreshToken: tokenResp.RefreshToken,
		TokenType:    tokenResp.TokenType,
		ExpiresIn:    tokenResp.ExpiresIn,
		UserEmail:    userInfo.Email,
		FirstName:    userInfo.FirstName,
		LastName:     userInfo.LastName,
	}, nil
}
