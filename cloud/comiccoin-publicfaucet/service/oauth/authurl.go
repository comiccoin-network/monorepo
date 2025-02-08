// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/service/oauth/authurl.go
package oauth

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/config"
	dom_oauthstate "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/domain/oauthstate"
	uc_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/usecase/oauth"
	uc_oauthstate "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/usecase/oauthstate"
)

type GetAuthURLRequest struct {
	RedirectURI string `json:"redirect_uri"`
	Scope       string `json:"scope"`
}

type GetAuthURLResponse struct {
	AuthURL   string    `json:"auth_url"`
	State     string    `json:"state"`
	ExpiresAt time.Time `json:"expires_at"`
}

type GetAuthURLService interface {
	Execute(ctx context.Context, req *GetAuthURLRequest) (*GetAuthURLResponse, error)
}

type getAuthURLServiceImpl struct {
	config             *config.Configuration
	logger             *slog.Logger
	getAuthURLUseCase  uc_oauth.GetAuthorizationURLUseCase
	createStateUseCase uc_oauthstate.CreateOAuthStateUseCase
}

func NewGetAuthURLService(
	config *config.Configuration,
	logger *slog.Logger,
	getAuthURLUseCase uc_oauth.GetAuthorizationURLUseCase,
	createStateUseCase uc_oauthstate.CreateOAuthStateUseCase,
) GetAuthURLService {
	return &getAuthURLServiceImpl{
		config:             config,
		logger:             logger,
		getAuthURLUseCase:  getAuthURLUseCase,
		createStateUseCase: createStateUseCase,
	}
}

func (s *getAuthURLServiceImpl) Execute(ctx context.Context, req *GetAuthURLRequest) (*GetAuthURLResponse, error) {
	// Create a new state with 15-minute expiry
	expiresAt := time.Now().Add(15 * time.Minute)
	state := &dom_oauthstate.OAuthState{
		State:     fmt.Sprintf("%v", time.Now().UnixNano()),
		CreatedAt: time.Now(),
		ExpiresAt: expiresAt,
	}

	// Store the state
	err := s.createStateUseCase.Execute(ctx, state)
	if err != nil {
		s.logger.Error("failed to create state",
			slog.Any("error", err))
		return nil, err
	}

	// Get authorization URL
	authURL, err := s.getAuthURLUseCase.Execute(ctx, state.State)
	if err != nil {
		s.logger.Error("failed to get authorization URL",
			slog.Any("error", err))
		return nil, err
	}

	return &GetAuthURLResponse{
		AuthURL:   authURL,
		State:     state.State,
		ExpiresAt: expiresAt,
	}, nil
}
