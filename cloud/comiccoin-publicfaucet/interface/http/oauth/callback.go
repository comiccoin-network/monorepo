// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/interface/http/oauth/callback.go
package oauth

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/config"
	service_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/service/oauth"
)

type CallbackHTTPHandler struct {
	config  *config.Configuration
	logger  *slog.Logger
	service service_oauth.CallbackService
}

func NewCallbackHTTPHandler(
	config *config.Configuration,
	logger *slog.Logger,
	service service_oauth.CallbackService,
) *CallbackHTTPHandler {
	return &CallbackHTTPHandler{
		config:  config,
		logger:  logger,
		service: service,
	}
}

type callbackResponseIDO struct {
	SessionID   string `json:"session_id"`
	AccessToken string `json:"access_token"`
	ExpiresAt   int64  `json:"expires_at"`
	TokenType   string `json:"token_type"`
}

func (h *CallbackHTTPHandler) Execute(w http.ResponseWriter, r *http.Request) {
	// Set response content type
	w.Header().Set("Content-Type", "application/json")

	// Get code and state from query parameters
	code := r.URL.Query().Get("code")
	state := r.URL.Query().Get("state")

	if code == "" || state == "" {
		h.logger.Error("missing required query parameters")
		httperror.ResponseError(w, httperror.NewForBadRequest(nil))
		return
	}

	// Create service request
	request := &service_oauth.CallbackRequest{
		Code:  code,
		State: state,
	}

	// Call service
	response, err := h.service.Execute(r.Context(), request)
	if err != nil {
		h.logger.Error("failed to process OAuth callback",
			slog.String("state", state),
			slog.Any("error", err))
		httperror.ResponseError(w, err)
		return
	}

	// Convert service response to IDO
	responseIDO := callbackResponseIDO{
		SessionID:   response.SessionID,
		AccessToken: response.AccessToken,
		ExpiresAt:   response.ExpiresAt.Unix(),
		TokenType:   response.TokenType,
	}

	// Set session cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "session_id",
		Value:    response.SessionID,
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
		Expires:  response.ExpiresAt,
	})

	// Encode response
	if err := json.NewEncoder(w).Encode(responseIDO); err != nil {
		h.logger.Error("failed to encode response",
			slog.Any("error", err))
		httperror.ResponseError(w, err)
		return
	}

	h.logger.Info("OAuth callback processed successfully",
		slog.String("session_id", response.SessionID))
}
