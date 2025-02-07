// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/interface/http/handler/oauth_introspect.go
package oauth

import (
	"encoding/json"
	"log/slog"
	"net/http"

	svc_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/service/oauth"
)

type IntrospectionHandler struct {
	logger               *slog.Logger
	introspectionService svc_oauth.IntrospectionService
}

func NewIntrospectionHandler(
	logger *slog.Logger,
	introspectionService svc_oauth.IntrospectionService,
) *IntrospectionHandler {
	return &IntrospectionHandler{
		logger:               logger,
		introspectionService: introspectionService,
	}
}

func (h *IntrospectionHandler) Execute(w http.ResponseWriter, r *http.Request) {
	h.logger.Info("handling introspection request",
		"method", r.Method,
		"path", r.URL.Path)

	// Extract and validate basic auth credentials
	clientID, clientSecret, ok := r.BasicAuth()
	if !ok {
		h.logger.Warn("missing basic auth credentials")
		w.Header().Set("WWW-Authenticate", `Basic realm="OAuth2 Token Introspection"`)
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Parse form data for token
	if err := r.ParseForm(); err != nil {
		h.logger.Error("failed to parse form data",
			"error", err)
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	token := r.FormValue("token")
	if token == "" {
		h.logger.Warn("missing token parameter")
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Create the introspection request DTO
	req := &svc_oauth.IntrospectionRequestDTO{
		Token:        token,
		ClientID:     clientID,
		ClientSecret: clientSecret,
	}

	// Process the introspection request
	response, err := h.introspectionService.IntrospectToken(r.Context(), req)
	if err != nil {
		h.logger.Error("introspection failed",
			"error", err,
			"client_id", clientID)
		// For security, we still return an inactive token response rather than an error
		json.NewEncoder(w).Encode(&svc_oauth.IntrospectionResponseDTO{Active: false})
		return
	}

	// Send the response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
