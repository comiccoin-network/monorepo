// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/interface/http/handler/oauth_authorize.go
package handler

import (
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"html/template"
	"log/slog"
	"net/http"
	"time"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/security/oauth"
)

// AuthorizeHandler handles the OAuth 2.0 authorization endpoint, which is the first
// step in the OAuth 2.0 authorization code flow. It validates the client's request
// and presents the user with a login form to authenticate and authorize the client.
type AuthorizeHandler struct {
	logger        *slog.Logger
	clientService oauth.ClientService
	authStore     oauth.AuthorizationStore
	loginTemplate *template.Template
}

// NewAuthorizeHandler creates a new instance of AuthorizeHandler with the necessary
// dependencies for handling authorization requests.
func NewAuthorizeHandler(
	logger *slog.Logger,
	clientService oauth.ClientService,
	authStore oauth.AuthorizationStore,
) *AuthorizeHandler {
	// Parse and prepare the login form template
	tmpl := template.Must(template.New("login").Parse(loginFormTemplate))

	return &AuthorizeHandler{
		logger:        logger,
		clientService: clientService,
		authStore:     authStore,
		loginTemplate: tmpl,
	}
}

// AuthorizeRequest represents the expected query parameters in an OAuth 2.0
// authorization request.
type AuthorizeRequest struct {
	ClientID     string // The client application's identifier
	RedirectURI  string // Where to send the user after authorization
	ResponseType string // Must be "code" for authorization code flow
	State        string // Optional state parameter for CSRF protection
	Scope        string // Optional requested scope of access
}

// generateRandomString creates a cryptographically secure random string of the
// specified length, used for generating secure tokens and authorization codes.
func generateRandomString(length int) string {
	b := make([]byte, length)
	if _, err := rand.Read(b); err != nil {
		return ""
	}
	return base64.URLEncoding.EncodeToString(b)[:length]
}

// Execute handles incoming authorization requests. It performs the following steps:
// 1. Validates the request parameters
// 2. Verifies the client's credentials
// 3. Stores the pending authorization
// 4. Displays the login form to the user
func (h *AuthorizeHandler) Execute(w http.ResponseWriter, r *http.Request) {
	h.logger.Info("handling authorize request",
		"method", r.Method,
		"path", r.URL.Path)

	// Parse and validate the authorization request
	authReq, err := h.parseAndValidateRequest(r)
	if err != nil {
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

	// Generate a unique authorization ID for this request
	authID := generateRandomString(32)

	// Create and store the pending authorization
	pendingAuth := oauth.PendingAuthorization{
		ClientID:    authReq.ClientID,
		RedirectURI: authReq.RedirectURI,
		State:       authReq.State,
		Scope:       authReq.Scope,
		ExpiresAt:   time.Now().Add(10 * time.Minute),
	}

	// Store the pending authorization
	if err := h.authStore.StorePendingAuth(authID, pendingAuth); err != nil {
		h.logger.Error("failed to store pending authorization",
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

// parseAndValidateRequest validates the OAuth authorization request parameters
// and ensures they meet the OAuth 2.0 specification requirements.
func (h *AuthorizeHandler) parseAndValidateRequest(r *http.Request) (*AuthorizeRequest, error) {
	// Only accept GET requests for authorization endpoint
	if r.Method != http.MethodGet {
		return nil, &oauth.ValidationError{
			ErrorCode:        "invalid_request",
			ErrorDescription: "Method not allowed",
		}
	}

	// Extract query parameters
	query := r.URL.Query()
	req := &AuthorizeRequest{
		ClientID:     query.Get("client_id"),
		RedirectURI:  query.Get("redirect_uri"),
		ResponseType: query.Get("response_type"),
		State:        query.Get("state"),
		Scope:        query.Get("scope"),
	}

	// Validate required parameters according to OAuth 2.0 spec
	if req.ClientID == "" {
		return nil, &oauth.ValidationError{
			ErrorCode:        "invalid_request",
			ErrorDescription: "client_id is required",
			State:            req.State,
		}
	}

	if req.RedirectURI == "" {
		return nil, &oauth.ValidationError{
			ErrorCode:        "invalid_request",
			ErrorDescription: "redirect_uri is required",
			State:            req.State,
		}
	}

	if req.ResponseType != "code" {
		return nil, &oauth.ValidationError{
			ErrorCode:        "unsupported_response_type",
			ErrorDescription: "response_type must be 'code'",
			State:            req.State,
		}
	}

	// Validate the client and their redirect URI
	valid, err := h.clientService.ValidateClient(req.ClientID, req.RedirectURI)
	if err != nil {
		return nil, fmt.Errorf("failed to validate client: %w", err)
	}

	if !valid {
		return nil, &oauth.ValidationError{
			ErrorCode:        "unauthorized_client",
			ErrorDescription: "Invalid client or redirect URI",
			State:            req.State,
		}
	}

	return req, nil
}

// handleValidationError handles OAuth 2.0 error responses according to the spec.
// If possible, it redirects the error back to the client's redirect URI.
func (h *AuthorizeHandler) handleValidationError(w http.ResponseWriter, r *http.Request, ve *oauth.ValidationError) {
	h.logger.Warn("validation error",
		"error", ve.ErrorCode,
		"description", ve.ErrorDescription)

	// If we don't have a redirect URI, show the error directly
	if r.URL.Query().Get("redirect_uri") == "" {
		http.Error(w, ve.Error(), http.StatusBadRequest)
		return
	}

	// Build the error redirect URL with all required parameters
	redirectURI := r.URL.Query().Get("redirect_uri")
	errorURL := fmt.Sprintf("%s?error=%s&error_description=%s",
		redirectURI,
		ve.ErrorCode,
		ve.ErrorDescription)

	// Include state parameter if it was provided
	if ve.State != "" {
		errorURL += fmt.Sprintf("&state=%s", ve.State)
	}

	// Redirect back to the client with the error
	http.Redirect(w, r, errorURL, http.StatusFound)
}

// Login form template with a clean, modern design
const loginFormTemplate = `
<!DOCTYPE html>
<html>
<head>
    <title>OAuth 2.0 Authorization</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 500px;
            margin: 50px auto;
            padding: 20px;
        }
        .container {
            border: 1px solid #ddd;
            padding: 20px;
            border-radius: 5px;
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
        }
        input[type="text"],
        input[type="password"] {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        button {
            background-color: #4CAF50;
            color: white;
            padding: 10px 15px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        .client-info {
            margin-bottom: 20px;
            padding: 10px;
            background-color: #f8f9fa;
            border-radius: 4px;
        }
        .scope-info {
            margin-top: 10px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="client-info">
            <h3>Authorization Request</h3>
            <p>Application <strong>{{.ClientID}}</strong> is requesting access to your account.</p>
            {{if .Scope}}
            <p class="scope-info">Requested permissions: {{.Scope}}</p>
            {{end}}
        </div>

        <form method="POST" action="/oauth/login">
            <input type="hidden" name="auth_id" value="{{.AuthID}}">

            <div class="form-group">
                <label for="username">Username:</label>
                <input type="text" id="username" name="username" required>
            </div>

            <div class="form-group">
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required>
            </div>

            <button type="submit">Authorize Application</button>
        </form>
    </div>
</body>
</html>
`
