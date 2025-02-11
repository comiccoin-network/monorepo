// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/interface/http/identity/register.go
package identity

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"strings"

	svc_identity "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/service/identity"
)

// GetIdentityHandler handles requests for fetching user profiles.
type GetIdentityHandler struct {
	logger  *slog.Logger
	service svc_identity.GetIdentityService
}

// NewGetIdentityHandler creates a new GetIdentityHandler instance.
func NewGetIdentityHandler(logger *slog.Logger, service svc_identity.GetIdentityService) *GetIdentityHandler {
	return &GetIdentityHandler{logger: logger, service: service}
}

// Execute handles the HTTP request to fetch the user profile.
func (h *GetIdentityHandler) Execute(w http.ResponseWriter, r *http.Request) {
	h.logger.Info("handling user profile request",
		slog.String("method", r.Method),
		slog.String("path", r.URL.Path))

	auth := r.Header.Get("Authorization")
	if auth == "" {
		h.logger.Error("missing authorization")
		http.Error(w, "Protected access point", http.StatusUnauthorized)
		return
	}
	accessToken := strings.Replace(auth, "Bearer ", "", -1)

	// Extract the user ID from the request context (previously set by middleware)
	ctx := r.Context()

	// Fetch the user profile using the use case
	identity, err := h.service.Execute(ctx, accessToken)
	if err != nil {
		h.logger.Error("failed to fetch user profile", slog.Any("error", err))
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// If user is not found, send a 404
	if identity == nil {
		h.logger.Warn("user not found")
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	// Set response headers
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	// Marshal and write the user profile to the response
	if err := json.NewEncoder(w).Encode(identity); err != nil {
		h.logger.Error("failed to encode identity", slog.Any("error", err))
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
}
