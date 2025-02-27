// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/interface/http/handler/oauth_token.go
package oauth

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/service/oauth"
)

type TokenHandler struct {
	logger       *slog.Logger
	tokenService oauth.TokenService
}

func NewTokenHandler(
	logger *slog.Logger,
	tokenService oauth.TokenService,
) *TokenHandler {
	return &TokenHandler{
		logger:       logger,
		tokenService: tokenService,
	}
}

func (h *TokenHandler) Execute(w http.ResponseWriter, r *http.Request) {
	h.logger.Info("handling token request",
		"method", r.Method,
		"path", r.URL.Path)

	// Verify HTTP method
	if r.Method != http.MethodPost {
		h.sendError(w, "invalid_request", "Method not allowed")
		return
	}

	// Parse form data
	if err := r.ParseForm(); err != nil {
		h.logger.Error("failed to parse form data",
			"error", err)
		h.sendError(w, "invalid_request", "Invalid form data")
		return
	}

	// Create token request DTO
	req := &oauth.TokenRequestDTO{
		GrantType:    r.FormValue("grant_type"),
		Code:         r.FormValue("code"),
		ClientID:     r.FormValue("client_id"),
		ClientSecret: r.FormValue("client_secret"),
		RedirectURI:  r.FormValue("redirect_uri"),
	}

	// Validate required fields
	if req.Code == "" || req.ClientID == "" || req.ClientSecret == "" || req.RedirectURI == "" {
		h.sendError(w, "invalid_request", "Missing required parameters")
		return
	}

	// Process the token exchange through the service
	response, err := h.tokenService.ExchangeToken(r.Context(), req)
	if err != nil {
		h.logger.Error("token exchange failed",
			"error", err,
			"client_id", req.ClientID)
		h.sendError(w, "invalid_grant", "Failed to exchange token")
		return
	}

	// Send successful response
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-store")
	json.NewEncoder(w).Encode(response)
}

func (h *TokenHandler) sendError(w http.ResponseWriter, error string, description string) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-store")
	w.WriteHeader(http.StatusBadRequest)
	json.NewEncoder(w).Encode(&oauth.TokenErrorDTO{
		Error:            error,
		ErrorDescription: description,
	})
}
