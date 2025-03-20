// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/service/oauth/exchange.go
package oauth

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/config"
	dom_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/domain/federatedidentity"
	dom_token "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/domain/token"
	uc_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/usecase/federatedidentity"
	uc_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/usecase/oauth"
	uc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/usecase/token"
)

type ExchangeTokenRequest struct {
	Code string
}

type ExchangeTokenResponse struct {
	AccessToken            string
	RefreshToken           string
	TokenType              string
	ExpiresIn              int
	FederatedIdentityEmail string
	FirstName              string
	LastName               string
}

type ExchangeService interface {
	ExchangeToken(ctx context.Context, req *ExchangeTokenRequest) (*ExchangeTokenResponse, error)
}

type exchangeServiceImpl struct {
	config                             *config.Configuration
	logger                             *slog.Logger
	exchangeCodeUseCase                uc_oauth.ExchangeCodeUseCase
	introspectTokenUseCase             uc_oauth.IntrospectTokenUseCase
	federatedidentityCreateUseCase     uc_federatedidentity.FederatedIdentityCreateUseCase
	federatedidentityGetByEmailUseCase uc_federatedidentity.FederatedIdentityGetByEmailUseCase
	tokenUpsertUseCase                 uc_token.TokenUpsertByFederatedIdentityIDUseCase
}

func NewExchangeService(
	config *config.Configuration,
	logger *slog.Logger,
	exchangeCodeUseCase uc_oauth.ExchangeCodeUseCase,
	introspectTokenUseCase uc_oauth.IntrospectTokenUseCase,
	federatedidentityCreateUseCase uc_federatedidentity.FederatedIdentityCreateUseCase,
	federatedidentityGetByEmailUseCase uc_federatedidentity.FederatedIdentityGetByEmailUseCase,
	tokenUpsertUseCase uc_token.TokenUpsertByFederatedIdentityIDUseCase,
) ExchangeService {
	return &exchangeServiceImpl{
		config:                             config,
		logger:                             logger,
		exchangeCodeUseCase:                exchangeCodeUseCase,
		introspectTokenUseCase:             introspectTokenUseCase,
		federatedidentityCreateUseCase:     federatedidentityCreateUseCase,
		federatedidentityGetByEmailUseCase: federatedidentityGetByEmailUseCase,
		tokenUpsertUseCase:                 tokenUpsertUseCase,
	}
}

func (s *exchangeServiceImpl) ExchangeToken(ctx context.Context, req *ExchangeTokenRequest) (*ExchangeTokenResponse, error) {
	// First exchange code for token as before
	tokenResp, err := s.exchangeCodeUseCase.Execute(ctx, req.Code)
	if err != nil {
		return nil, fmt.Errorf("exchanging code: %w", err)
	}

	// Get federatedidentity info through introspection
	federatedidentityInfo, err := s.introspectTokenUseCase.Execute(ctx, tokenResp.AccessToken)
	if err != nil {
		return nil, fmt.Errorf("getting federatedidentity info: %w", err)
	}

	// Convert federatedidentity ID from introspection response
	federatedidentityID, err := primitive.ObjectIDFromHex(federatedidentityInfo.FederatedIdentityID)
	if err != nil {
		return nil, fmt.Errorf("invalid federatedidentity ID format: %w", err)
	}

	// Check if federatedidentity exists in our system
	existingFederatedIdentity, err := s.federatedidentityGetByEmailUseCase.Execute(ctx, federatedidentityInfo.Email)
	if err != nil {
		return nil, fmt.Errorf("checking federatedidentity: %w", err)
	}

	var finalFederatedIdentityID primitive.ObjectID
	if existingFederatedIdentity == nil {
		// Create new federatedidentity if they don't exist
		newFederatedIdentity := &dom_federatedidentity.FederatedIdentity{
			ID:          federatedidentityID, // Use the ID from introspection
			Email:       federatedidentityInfo.Email,
			FirstName:   federatedidentityInfo.FirstName,
			LastName:    federatedidentityInfo.LastName,
			Name:        fmt.Sprintf("%s %s", federatedidentityInfo.FirstName, federatedidentityInfo.LastName),
			LexicalName: fmt.Sprintf("%s, %s", federatedidentityInfo.LastName, federatedidentityInfo.FirstName),
			Status:      dom_federatedidentity.FederatedIdentityStatusActive,
			CreatedAt:   time.Now(),
			ModifiedAt:  time.Now(),
		}

		if err := s.federatedidentityCreateUseCase.Execute(ctx, newFederatedIdentity); err != nil {
			return nil, fmt.Errorf("creating federatedidentity: %w", err)
		}
		finalFederatedIdentityID = newFederatedIdentity.ID
	} else {
		finalFederatedIdentityID = existingFederatedIdentity.ID
	}

	// Create and store token
	token := &dom_token.Token{
		ID:                  primitive.NewObjectID(),
		FederatedIdentityID: finalFederatedIdentityID,
		AccessToken:         tokenResp.AccessToken,
		RefreshToken:        tokenResp.RefreshToken,
		ExpiresAt:           tokenResp.ExpiresAt,
	}

	s.logger.Info("storing new access and refresh token",
		slog.String("token_id", token.ID.Hex()[:5]+"..."),
		slog.String("federatedidentity_id", token.FederatedIdentityID.Hex()),
		slog.Time("expires_at", token.ExpiresAt))

	// Store token using token upsert use case
	if err := s.tokenUpsertUseCase.Execute(ctx, token); err != nil {
		return nil, fmt.Errorf("storing token: %w", err)
	}

	s.logger.Info("successfully stored access and refresh token",
		slog.String("token_id", token.ID.Hex()[:5]+"..."))

	return &ExchangeTokenResponse{
		AccessToken:            tokenResp.AccessToken,
		RefreshToken:           tokenResp.RefreshToken,
		TokenType:              tokenResp.TokenType,
		ExpiresIn:              tokenResp.ExpiresIn,
		FederatedIdentityEmail: federatedidentityInfo.Email,
		FirstName:              federatedidentityInfo.FirstName,
		LastName:               federatedidentityInfo.LastName,
	}, nil
}
