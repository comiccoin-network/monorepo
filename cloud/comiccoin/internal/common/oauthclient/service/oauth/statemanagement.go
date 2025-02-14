// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/service/oauth/statemanagement.go
package oauth

import (
	"context"
	"errors"
	"log/slog"
	"time"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/config"
	uc_oauthstate "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/usecase/oauthstate"
)

type StateVerifyRequest struct {
	State string `json:"state"`
}

type StateVerifyResponse struct {
	Valid     bool      `json:"valid"`
	ExpiresAt time.Time `json:"expires_at,omitempty"`
}

type StateManagementService interface {
	VerifyState(ctx context.Context, req *StateVerifyRequest) (*StateVerifyResponse, error)
	CleanupExpiredStates(ctx context.Context) error
}

type stateManagementServiceImpl struct {
	config               *config.Configuration
	logger               *slog.Logger
	getStateUseCase      uc_oauthstate.GetOAuthStateUseCase
	deleteStateUseCase   uc_oauthstate.DeleteOAuthStateUseCase
	deleteExpiredUseCase uc_oauthstate.DeleteExpiredOAuthStatesUseCase
}

func NewStateManagementService(
	config *config.Configuration,
	logger *slog.Logger,
	getStateUseCase uc_oauthstate.GetOAuthStateUseCase,
	deleteStateUseCase uc_oauthstate.DeleteOAuthStateUseCase,
	deleteExpiredUseCase uc_oauthstate.DeleteExpiredOAuthStatesUseCase,
) StateManagementService {
	return &stateManagementServiceImpl{
		config:               config,
		logger:               logger,
		getStateUseCase:      getStateUseCase,
		deleteStateUseCase:   deleteStateUseCase,
		deleteExpiredUseCase: deleteExpiredUseCase,
	}
}

func (s *stateManagementServiceImpl) VerifyState(ctx context.Context, req *StateVerifyRequest) (*StateVerifyResponse, error) {
	if req.State == "" {
		return nil, errors.New("state is required")
	}

	state, err := s.getStateUseCase.Execute(ctx, req.State)
	if err != nil {
		s.logger.Error("failed to get state",
			slog.String("state", req.State),
			slog.Any("error", err))
		return nil, err
	}

	if state == nil {
		return &StateVerifyResponse{
			Valid: false,
		}, nil
	}

	// Check if state has expired
	if time.Now().After(state.ExpiresAt) {
		// Clean up expired state
		err = s.deleteStateUseCase.Execute(ctx, req.State)
		if err != nil {
			s.logger.Error("failed to delete expired state",
				slog.String("state", req.State),
				slog.Any("error", err))
		}
		return &StateVerifyResponse{
			Valid: false,
		}, nil
	}

	return &StateVerifyResponse{
		Valid:     true,
		ExpiresAt: state.ExpiresAt,
	}, nil
}

func (s *stateManagementServiceImpl) CleanupExpiredStates(ctx context.Context) error {
	err := s.deleteExpiredUseCase.Execute(ctx)
	if err != nil {
		s.logger.Error("failed to cleanup expired states",
			slog.Any("error", err))
		return err
	}

	s.logger.Info("completed cleanup of expired states")
	return nil
}
