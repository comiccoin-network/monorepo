// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/interface/http/handler/oauth_introspect.go
package handler

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"time"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/oauth"
)

// IntrospectionHandler implements OAuth 2.0 token introspection
type IntrospectionHandler struct {
	logger        *slog.Logger
	clientService oauth.ClientService
	tokenStore    oauth.TokenStore
}

func NewIntrospectionHandler(
	logger *slog.Logger,
	clientService oauth.ClientService,
	tokenStore oauth.TokenStore,
) *IntrospectionHandler {
	return &IntrospectionHandler{
		logger:        logger,
		clientService: clientService,
		tokenStore:    tokenStore,
	}
}

func (h *IntrospectionHandler) Execute(w http.ResponseWriter, r *http.Request) {
	// Token introspection must be authenticated
	clientID, clientSecret, ok := r.BasicAuth()
	if !ok {
		w.Header().Set("WWW-Authenticate", `Basic realm="OAuth2 Token Introspection"`)
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Validate client credentials
	valid, err := h.clientService.ValidateClientCredentials(clientID, clientSecret)
	if err != nil || !valid {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Get the token to introspect
	token := r.FormValue("token")
	if token == "" {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Get token info from storage
	tokenInfo, err := h.tokenStore.GetToken(token)
	if err != nil {
		// Return inactive token response instead of error
		json.NewEncoder(w).Encode(oauth.IntrospectionResponse{Active: false})
		return
	}

	// Check if token is still valid
	isActive := !tokenInfo.IsRevoked && time.Now().Before(tokenInfo.ExpiresAt)

	// Prepare the response
	response := oauth.IntrospectionResponse{
		Active:    isActive,
		Scope:     tokenInfo.Scope,
		ClientID:  tokenInfo.ClientID,
		ExpiresAt: tokenInfo.ExpiresAt.Unix(),
		IssuedAt:  tokenInfo.ExpiresAt.Add(-1 * time.Hour).Unix(), // Approximate issue time
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
