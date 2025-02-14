// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/interface/http/handler/oauth_refresh.go
package oauth

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/domain/token"
	svc_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/service/oauth"
)

type RefreshTokenHandler struct {
	logger              *slog.Logger
	refreshTokenService svc_oauth.RefreshTokenService
}

func NewRefreshTokenHandler(
	logger *slog.Logger,
	refreshTokenService svc_oauth.RefreshTokenService,
) *RefreshTokenHandler {
	return &RefreshTokenHandler{
		logger:              logger,
		refreshTokenService: refreshTokenService,
	}
}

func (h *RefreshTokenHandler) Execute(w http.ResponseWriter, r *http.Request) {
	h.logger.Info("handling refresh token request",
		"method", r.Method,
		"path", r.URL.Path)

	// Verify method
	if r.Method != http.MethodPost {
		h.sendError(w, "invalid_request", "Method not allowed")
		return
	}

	// Parse form data
	if err := r.ParseForm(); err != nil {
		h.sendError(w, "invalid_request", "Invalid form data")
		return
	}

	// Create the refresh token request DTO
	req := &svc_oauth.RefreshTokenRequestDTO{
		GrantType:    r.FormValue("grant_type"),
		RefreshToken: r.FormValue("refresh_token"),
		ClientID:     r.FormValue("client_id"),
		ClientSecret: r.FormValue("client_secret"),
	}

	// Validate required fields
	if req.RefreshToken == "" || req.ClientID == "" || req.ClientSecret == "" {
		h.sendError(w, "invalid_request", "Missing required parameters")
		return
	}

	// Process the refresh token request
	response, err := h.refreshTokenService.RefreshToken(r.Context(), req)
	if err != nil {
		h.logger.Error("refresh token failed",
			"error", err,
			"client_id", req.ClientID)
		switch {
		case errors.Is(err, token.ErrTokenNotFound):
			h.sendError(w, "invalid_grant", "Your session has expired. Please log in again to continue.")
		default:
			h.sendError(w, "invalid_grant", "Failed to refresh token")
		}
		return
	}

	// Send successful response
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-store")
	json.NewEncoder(w).Encode(response)
}

func (h *RefreshTokenHandler) sendError(w http.ResponseWriter, error string, description string) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-store")
	w.WriteHeader(http.StatusBadRequest)
	json.NewEncoder(w).Encode(map[string]string{
		"error":             error,
		"error_description": description,
	})
}
