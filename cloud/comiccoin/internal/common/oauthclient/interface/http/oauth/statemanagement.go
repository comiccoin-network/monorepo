// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/interface/http/handler/oauth/statemanagement.go
package oauth

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/config"
	service_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/service/oauth"
)

type StateManagementHTTPHandler struct {
	config  *config.Configuration
	logger  *slog.Logger
	service service_oauth.StateManagementService
}

func NewStateManagementHTTPHandler(
	config *config.Configuration,
	logger *slog.Logger,
	service service_oauth.StateManagementService,
) *StateManagementHTTPHandler {
	return &StateManagementHTTPHandler{
		config:  config,
		logger:  logger,
		service: service,
	}
}

type stateVerifyResponseIDO struct {
	Valid     bool  `json:"valid"`
	ExpiresAt int64 `json:"expires_at,omitempty"`
}

func (h *StateManagementHTTPHandler) VerifyState(w http.ResponseWriter, r *http.Request) {
	// Set response content type
	w.Header().Set("Content-Type", "application/json")

	// Get state from query parameter
	state := r.URL.Query().Get("state")
	if state == "" {
		h.logger.Error("missing state parameter")
		httperror.ResponseError(w, httperror.NewForBadRequest(nil))
		return
	}

	// Create service request
	request := &service_oauth.StateVerifyRequest{
		State: state,
	}

	// Call service
	response, err := h.service.VerifyState(r.Context(), request)
	if err != nil {
		h.logger.Error("failed to verify state",
			slog.String("state", state),
			slog.Any("error", err))
		httperror.ResponseError(w, err)
		return
	}

	// Convert service response to IDO
	responseIDO := stateVerifyResponseIDO{
		Valid: response.Valid,
	}
	if response.Valid {
		responseIDO.ExpiresAt = response.ExpiresAt.Unix()
	}

	// Encode response
	if err := json.NewEncoder(w).Encode(responseIDO); err != nil {
		h.logger.Error("failed to encode response",
			slog.Any("error", err))
		httperror.ResponseError(w, err)
		return
	}

	h.logger.Info("state verification completed",
		slog.String("state", state),
		slog.Bool("valid", response.Valid))
}

func (h *StateManagementHTTPHandler) CleanupExpiredStates(w http.ResponseWriter, r *http.Request) {
	// Set response content type
	w.Header().Set("Content-Type", "application/json")

	// Call service
	err := h.service.CleanupExpiredStates(r.Context())
	if err != nil {
		h.logger.Error("failed to cleanup expired states",
			slog.Any("error", err))
		httperror.ResponseError(w, err)
		return
	}

	// Send success response
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"status": "completed",
	})

	h.logger.Info("expired states cleanup completed")
}
