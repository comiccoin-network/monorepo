// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/interface/http/handler/oauth_token.go
package handler

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"time"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/security/oauth"
)

// TokenHandler handles the OAuth 2.0 token endpoint, which exchanges
// authorization codes for access tokens.
type TokenHandler struct {
	logger        *slog.Logger
	clientService oauth.ClientService
	authStore     oauth.AuthorizationStore
}

// NewTokenHandler creates a new instance of TokenHandler with the required dependencies
func NewTokenHandler(
	logger *slog.Logger,
	clientService oauth.ClientService,
	authStore oauth.AuthorizationStore,
) *TokenHandler {
	return &TokenHandler{
		logger:        logger,
		clientService: clientService,
		authStore:     authStore,
	}
}

// Execute handles the token exchange request
func (h *TokenHandler) Execute(w http.ResponseWriter, r *http.Request) {
	h.logger.Info("handling token request",
		"method", r.Method,
		"path", r.URL.Path)

	// Verify this is a POST request
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse the form data
	if err := r.ParseForm(); err != nil {
		h.logger.Error("failed to parse form data",
			"error", err)
		h.sendError(w, "invalid_request", "Invalid form data")
		return
	}

	// Extract form values
	grantType := r.FormValue("grant_type")
	code := r.FormValue("code")
	clientID := r.FormValue("client_id")
	clientSecret := r.FormValue("client_secret")
	redirectURI := r.FormValue("redirect_uri")

	// Validate grant type
	if grantType != "authorization_code" {
		h.sendError(w, "unsupported_grant_type", "Only authorization_code grant type is supported")
		return
	}

	// Validate required parameters
	if code == "" || clientID == "" || clientSecret == "" || redirectURI == "" {
		h.sendError(w, "invalid_request", "Missing required parameters")
		return
	}

	// Validate client credentials
	valid, err := h.clientService.ValidateClientCredentials(clientID, clientSecret)
	if err != nil {
		h.logger.Error("failed to validate client credentials",
			"error", err,
			"client_id", clientID)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	if !valid {
		h.sendError(w, "invalid_client", "Invalid client credentials")
		return
	}

	// Get and validate the authorization code
	authCode, err := h.authStore.GetAuthorizationCode(code)
	if err != nil {
		if errors.Is(err, oauth.ErrAuthorizationNotFound) {
			h.sendError(w, "invalid_grant", "Invalid or expired authorization code")
			return
		}
		h.logger.Error("failed to get authorization code",
			"error", err,
			"code", code)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// Verify the code hasn't expired
	if time.Now().After(authCode.ExpiresAt) {
		h.sendError(w, "invalid_grant", "Authorization code has expired")
		return
	}

	// Verify the client ID matches
	if authCode.ClientID != clientID {
		h.sendError(w, "invalid_grant", "Authorization code was not issued to this client")
		return
	}

	// Verify the redirect URI matches
	if authCode.RedirectURI != redirectURI {
		h.sendError(w, "invalid_grant", "Redirect URI does not match the original request")
		return
	}

	// Generate access token
	accessToken := generateRandomString(32)

	// Delete the used authorization code
	if err := h.authStore.DeleteAuthorizationCode(code); err != nil {
		h.logger.Error("failed to delete authorization code",
			"error", err,
			"code", code)
		// Continue despite error as this is not critical
	}

	// Prepare the response
	response := oauth.TokenResponse{
		AccessToken: accessToken,
		TokenType:   "Bearer",
		ExpiresIn:   3600, // 1 hour
	}

	// Send the successful response
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-store")
	json.NewEncoder(w).Encode(response)
}

// sendError sends an OAuth 2.0 error response according to the specification
func (h *TokenHandler) sendError(w http.ResponseWriter, error string, description string) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-store")
	w.WriteHeader(http.StatusBadRequest)
	json.NewEncoder(w).Encode(map[string]string{
		"error":             error,
		"error_description": description,
	})
}
