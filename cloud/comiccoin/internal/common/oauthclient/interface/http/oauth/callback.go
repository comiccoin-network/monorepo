// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/interface/http/oauth/callback.go
package oauth

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/config"
	service_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/service/oauth"
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
	successURI := r.URL.Query().Get("success_uri")

	if code == "" {
		h.logger.Error("missing required `code` parameters", slog.Any("parameters", r.URL.Query()))
		httperror.ResponseError(w, httperror.NewForBadRequestWithSingleField("code", "required parameter"))
		return
	}
	if state == "" {
		h.logger.Error("missing required `state` parameters", slog.Any("parameters", r.URL.Query()))
		httperror.ResponseError(w, httperror.NewForBadRequestWithSingleField("state", "required parameter"))
		return
	}
	if successURI == "" {
		h.logger.Error("missing `success_uri` parameter", slog.Any("parameters", r.URL.Query()))
		httperror.ResponseError(w, httperror.NewForBadRequestWithSingleField("success_uri", "required parameter"))
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

	if successURI != "" {
		successURI += fmt.Sprintf("?access_token=%v&refresh_token=%v&expires_at=%v", response.AccessToken, response.RefreshToken, response.ExpiresAt.Unix())
		h.logger.Info("Redirecting now...",
			slog.String("successURI", successURI))
		http.Redirect(w, r, successURI, http.StatusFound)
		return
	}

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
