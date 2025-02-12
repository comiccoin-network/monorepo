// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/interface/http/handler/oauth_login.go
package oauth

import (
	"log/slog"
	"net/http"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/service/oauth"
)

// LoginHandler is responsible for handling HTTP requests related to the OAuth login process.
// It follows clean architecture principles by depending on the service layer for business logic
// and focusing solely on HTTP-specific concerns like request parsing and response formatting.
type LoginHandler struct {
	logger       *slog.Logger
	loginService oauth.LoginService
}

// NewLoginHandler creates a new instance of LoginHandler with its required dependencies.
// By accepting interfaces rather than concrete implementations, we maintain loose coupling
// and make the code more testable.
func NewLoginHandler(
	logger *slog.Logger,
	loginService oauth.LoginService,
) *LoginHandler {
	return &LoginHandler{
		logger:       logger,
		loginService: loginService,
	}
}

// Execute handles the HTTP request for OAuth login. This method is responsible for:
// 1. Validating the HTTP method and request format
// 2. Extracting and validating form data
// 3. Calling the service layer to process the login
// 4. Handling the response appropriately (redirect or error)
func (h *LoginHandler) Execute(w http.ResponseWriter, r *http.Request) {
	// Log the incoming request for monitoring and debugging
	h.logger.Info("handling login request",
		"method", r.Method,
		"path", r.URL.Path)

	// Ensure we only accept POST requests for login
	if r.Method != http.MethodPost {
		h.logger.Warn("incorrect HTTP method used",
			"method", r.Method)
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse the form data from the request
	if err := r.ParseForm(); err != nil {
		h.logger.Error("failed to parse form data",
			"error", err)
		http.Error(w, "Invalid form data", http.StatusBadRequest)
		return
	}

	// Extract required fields from the form
	username := r.FormValue("username")
	password := r.FormValue("password")
	authID := r.FormValue("auth_id")
	state := r.FormValue("state")
	successURI := r.FormValue("success_uri")

	// Validate that all required fields are present
	if username == "" {
		h.logger.Error("missing required `username` value")
		httperror.ResponseError(w, httperror.NewForBadRequestWithSingleField("username", "required value"))
		return
	}
	if password == "" {
		h.logger.Error("missing required `password` value")
		httperror.ResponseError(w, httperror.NewForBadRequestWithSingleField("password", "required value"))
		return
	}

	if authID == "" {
		h.logger.Error("missing required `auth_id` value")
		httperror.ResponseError(w, httperror.NewForBadRequestWithSingleField("auth_id", "required value"))
		return
	}
	if successURI == "" {
		h.logger.Error("missing required `success_uri` value")
		httperror.ResponseError(w, httperror.NewForBadRequestWithSingleField("success_uri", "required value"))
		return
	}

	// Process the login through the service layer
	// The service layer handles all business logic, including:
	// - FederatedIdentity authentication
	// - Authorization code generation
	// - State management
	result, err := h.loginService.ProcessLogin(r.Context(), username, password, authID)
	if err != nil {
		// Log the error but don't expose internal details to the client
		h.logger.Error("login processing failed",
			"error", err,
			"username", username)

		// Return a generic error to the client
		http.Error(w, "Authentication failed", http.StatusUnauthorized)
		return
	}

	// Construct the redirect URL with the authorization code
	// This follows the OAuth 2.0 specification for the authorization code flow
	redirectURL := result.RedirectURI + "?code=" + result.Code

	// Include the state parameter as the state parameter helps prevent CSRF attacks
	redirectURL += "&state=" + state

	// Include the success_uri parameter so we can redirect to success.
	redirectURL += "&success_uri=" + successURI

	// Redirect the federatedidentity back to the client application
	// This completes the login phase of the OAuth flow
	h.logger.Info("redirecting federatedidentity after successful login",
		"redirect_uri", redirectURL)
	http.Redirect(w, r, redirectURL, http.StatusFound)
}
