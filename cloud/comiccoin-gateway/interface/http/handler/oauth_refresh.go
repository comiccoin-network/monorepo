package handler

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"time"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/oauth"
)

// RefreshTokenHandler handles OAuth 2.0 refresh token requests
type RefreshTokenHandler struct {
	logger        *slog.Logger
	clientService oauth.ClientService
	tokenStore    oauth.TokenStore
	authStore     oauth.AuthorizationStore
}

func NewRefreshTokenHandler(
	logger *slog.Logger,
	clientService oauth.ClientService,
	tokenStore oauth.TokenStore,
	authStore oauth.AuthorizationStore,
) *RefreshTokenHandler {
	return &RefreshTokenHandler{
		logger:        logger,
		clientService: clientService,
		tokenStore:    tokenStore,
		authStore:     authStore,
	}
}

// sendError sends an OAuth 2.0 error response
func (h *RefreshTokenHandler) sendError(w http.ResponseWriter, error string, description string) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-store")
	w.WriteHeader(http.StatusBadRequest)
	json.NewEncoder(w).Encode(map[string]string{
		"error":             error,
		"error_description": description,
	})
}

func (h *RefreshTokenHandler) Execute(w http.ResponseWriter, r *http.Request) {
	// Verify method and parse form
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	if err := r.ParseForm(); err != nil {
		h.sendError(w, "invalid_request", "Invalid form data")
		return
	}

	// Extract and validate parameters
	grantType := r.FormValue("grant_type")
	refreshToken := r.FormValue("refresh_token")
	clientID := r.FormValue("client_id")
	clientSecret := r.FormValue("client_secret")

	if grantType != "refresh_token" {
		h.sendError(w, "invalid_grant", "Invalid grant type")
		return
	}

	// Validate client credentials
	valid, err := h.clientService.ValidateClientCredentials(clientID, clientSecret)
	if err != nil || !valid {
		h.sendError(w, "invalid_client", "Invalid client credentials")
		return
	}

	// Get stored token information
	token, err := h.tokenStore.GetToken(refreshToken)
	if err != nil {
		h.sendError(w, "invalid_grant", "Invalid refresh token")
		return
	}

	// Generate new tokens
	newAccessToken := generateRandomString(32)
	newRefreshToken := generateRandomString(32)

	// Store the new access token
	accessToken := &oauth.Token{
		TokenID:   newAccessToken,
		TokenType: "access",
		UserID:    token.UserID,
		ClientID:  clientID,
		Scope:     token.Scope,
		ExpiresAt: time.Now().Add(1 * time.Hour),
	}

	// Store the new refresh token
	refreshTokenObj := &oauth.Token{
		TokenID:   newRefreshToken,
		TokenType: "refresh",
		UserID:    token.UserID,
		ClientID:  clientID,
		Scope:     token.Scope,
		ExpiresAt: time.Now().Add(30 * 24 * time.Hour), // 30 days
	}

	// Store both tokens
	if err := h.tokenStore.StoreToken(accessToken); err != nil {
		h.logger.Error("failed to store access token", "error", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	if err := h.tokenStore.StoreToken(refreshTokenObj); err != nil {
		h.logger.Error("failed to store refresh token", "error", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// Revoke the old refresh token
	if err := h.tokenStore.RevokeToken(refreshToken); err != nil {
		h.logger.Error("failed to revoke old refresh token", "error", err)
		// Continue despite error
	}

	// Send the response
	response := oauth.TokenResponse{
		AccessToken:  newAccessToken,
		TokenType:    "Bearer",
		ExpiresIn:    3600,
		RefreshToken: newRefreshToken,
		Scope:        token.Scope,
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-store")
	json.NewEncoder(w).Encode(response)
}
