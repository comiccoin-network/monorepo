// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/service/oauth/authurl.go
package oauth

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/config"
	dom_oauthstate "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/domain/oauthstate"
	uc_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/usecase/oauth"
	uc_oauthstate "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/usecase/oauthstate"
)

type GetRegistrationURLResponse struct {
	RegistrationURL string `json:"registration_url"`
}

type GetRegistrationURLService interface {
	Execute(ctx context.Context) (*GetRegistrationURLResponse, error)
}

type getRegistrationURLServiceImpl struct {
	config                    *config.Configuration
	logger                    *slog.Logger
	getRegistrationURLUseCase uc_oauth.GetRegistrationURLUseCase
	createStateUseCase        uc_oauthstate.CreateOAuthStateUseCase
}

func NewGetRegistrationURLService(
	config *config.Configuration,
	logger *slog.Logger,
	getRegistrationURLUseCase uc_oauth.GetRegistrationURLUseCase,
	createStateUseCase uc_oauthstate.CreateOAuthStateUseCase,
) GetRegistrationURLService {
	return &getRegistrationURLServiceImpl{
		config:                    config,
		logger:                    logger,
		getRegistrationURLUseCase: getRegistrationURLUseCase,
		createStateUseCase:        createStateUseCase,
	}
}

func (s *getRegistrationURLServiceImpl) Execute(ctx context.Context) (*GetRegistrationURLResponse, error) {
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
	aURL, err := s.getRegistrationURLUseCase.Execute(ctx, state.State)
	if err != nil {
		s.logger.Error("failed to get authorization URL",
			slog.Any("error", err))
		return nil, err
	}

	return &GetRegistrationURLResponse{
		RegistrationURL: aURL,
	}, nil
}
