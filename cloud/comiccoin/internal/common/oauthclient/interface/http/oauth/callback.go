package oauth

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"strings"

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
	// Log the incoming request
	h.logger.Info("handling OAuth callback request",
		slog.String("method", r.Method),
		slog.String("path", r.URL.Path),
		slog.Any("query", r.URL.Query()))

	// Get and validate required parameters
	code := r.URL.Query().Get("code")
	state := r.URL.Query().Get("state")
	successURI := r.URL.Query().Get("success_uri")

	if code == "" {
		h.logger.Error("missing required `code` parameter")
		httperror.ResponseError(w, httperror.NewForBadRequestWithSingleField("code", "required parameter"))
		return
	}
	if state == "" {
		h.logger.Error("missing required `state` parameter")
		httperror.ResponseError(w, httperror.NewForBadRequestWithSingleField("state", "required parameter"))
		return
	}
	if successURI == "" {
		h.logger.Error("missing required `success_uri` parameter")
		httperror.ResponseError(w, httperror.NewForBadRequestWithSingleField("success_uri", "required parameter"))
		return
	}

	// Process OAuth callback through service
	request := &service_oauth.CallbackRequest{
		Code:  code,
		State: state,
	}

	response, err := h.service.Execute(r.Context(), request)
	if err != nil {
		h.logger.Error("failed to process OAuth callback",
			slog.String("state", state),
			slog.Any("error", err))
		httperror.ResponseError(w, err)
		return
	}

	// Set the session cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "session_id",
		Value:    response.SessionID,
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode, // Use Lax mode to allow redirects
		Expires:  response.ExpiresAt,
	})

	// Handle redirect if successURI is provided
	if successURI != "" {
		// Build redirect URL with query parameters
		redirectURL := successURI
		if !strings.Contains(successURI, "?") {
			redirectURL += "?"
		} else {
			redirectURL += "&"
		}

		// Add OAuth response parameters
		params := fmt.Sprintf("access_token=%v&refresh_token=%v&expires_at=%v&session_id=%v",
			response.AccessToken,
			response.RefreshToken,
			response.ExpiresAt.Unix(),
			response.SessionID)

		redirectURL += params

		h.logger.Info("redirecting to success URI",
			slog.String("redirect_url", redirectURL))

		// Perform the redirect
		http.Redirect(w, r, redirectURL, http.StatusFound)
		return
	}

	// If no redirect, return JSON response
	// Set content type for JSON response
	w.Header().Set("Content-Type", "application/json")

	// Prepare JSON response
	responseIDO := callbackResponseIDO{
		SessionID:   response.SessionID,
		AccessToken: response.AccessToken,
		ExpiresAt:   response.ExpiresAt.Unix(),
		TokenType:   response.TokenType,
	}

	// Encode and send JSON response
	if err := json.NewEncoder(w).Encode(responseIDO); err != nil {
		h.logger.Error("failed to encode JSON response",
			slog.Any("error", err))
		httperror.ResponseError(w, err)
		return
	}

	h.logger.Info("OAuth callback processed successfully",
		slog.String("session_id", response.SessionID))
}
