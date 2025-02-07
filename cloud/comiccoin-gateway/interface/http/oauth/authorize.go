// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/interface/http/oauth/authorize.go
package handler

import (
	"errors"
	"fmt"
	"html/template"
	"log/slog"
	"net/http"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/security/oauth"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/service/oauth"
)

// AuthorizeHandler handles the OAuth 2.0 authorization endpoint
type AuthorizeHandler struct {
	logger           *slog.Logger
	authorizeService oauth.AuthorizeService
	loginTemplate    *template.Template
}

// NewAuthorizeHandler creates a new instance of AuthorizeHandler
func NewAuthorizeHandler(
	logger *slog.Logger,
	authorizeService oauth.AuthorizeService,
) *AuthorizeHandler {
	// Parse and prepare the login form template
	tmpl := template.Must(template.New("login").Parse(loginFormTemplate))

	return &AuthorizeHandler{
		logger:           logger,
		authorizeService: authorizeService,
		loginTemplate:    tmpl,
	}
}

// Execute handles incoming authorization requests
func (h *AuthorizeHandler) Execute(w http.ResponseWriter, r *http.Request) {
	h.logger.Info("handling authorize request",
		"method", r.Method,
		"path", r.URL.Path)

	// Extract and validate the request parameters
	authReq := &oauth.AuthorizeRequest{
		ClientID:     r.URL.Query().Get("client_id"),
		RedirectURI:  r.URL.Query().Get("redirect_uri"),
		ResponseType: r.URL.Query().Get("response_type"),
		State:        r.URL.Query().Get("state"),
		Scope:        r.URL.Query().Get("scope"),
	}

	// Validate the request parameters using our service
	if err := h.authorizeService.ValidateAuthorizationRequest(authReq); err != nil {
		var validationErr *oauth.ValidationError
		if errors.As(err, &validationErr) {
			h.handleValidationError(w, r, validationErr)
			return
		}

		h.logger.Error("internal server error",
			"error", err,
			"client_id", authReq.ClientID)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// Create a pending authorization using our service
	authID, err := h.authorizeService.CreatePendingAuthorization(authReq)
	if err != nil {
		h.logger.Error("failed to create pending authorization",
			"error", err,
			"client_id", authReq.ClientID)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// Prepare the data for the login template
	data := struct {
		ClientID string
		AuthID   string
		Scope    string
	}{
		ClientID: authReq.ClientID,
		AuthID:   authID,
		Scope:    authReq.Scope,
	}

	// Render the login form
	if err := h.loginTemplate.Execute(w, data); err != nil {
		h.logger.Error("failed to render template",
			"error", err,
			"client_id", authReq.ClientID)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
}

// handleValidationError handles OAuth 2.0 error responses
func (h *AuthorizeHandler) handleValidationError(w http.ResponseWriter, r *http.Request, ve *oauth.ValidationError) {
	h.logger.Warn("validation error",
		"error", ve.ErrorCode,
		"description", ve.ErrorDescription)

	// If we don't have a redirect URI, show the error directly
	if r.URL.Query().Get("redirect_uri") == "" {
		http.Error(w, ve.Error(), http.StatusBadRequest)
		return
	}

	// Build the error redirect URL
	redirectURI := r.URL.Query().Get("redirect_uri")
	errorURL := fmt.Sprintf("%s?error=%s&error_description=%s",
		redirectURI,
		ve.ErrorCode,
		ve.ErrorDescription)

	if ve.State != "" {
		errorURL += fmt.Sprintf("&state=%s", ve.State)
	}

	// Redirect back to the client with the error
	http.Redirect(w, r, errorURL, http.StatusFound)
}
