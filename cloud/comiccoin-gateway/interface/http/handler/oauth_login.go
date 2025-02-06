// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/interface/http/handler/oauth_login.go
package handler

import (
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"time"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/oauth"
)

// LoginHandler handles the OAuth 2.0 login endpoint, which authenticates the user
// and issues an authorization code if successful.
type LoginHandler struct {
	logger      *slog.Logger
	authStore   oauth.AuthorizationStore
	userService oauth.UserService
}

// NewLoginHandler creates a new instance of LoginHandler with the required dependencies
func NewLoginHandler(
	logger *slog.Logger,
	authStore oauth.AuthorizationStore,
	userService oauth.UserService,
) *LoginHandler {
	return &LoginHandler{
		logger:      logger,
		authStore:   authStore,
		userService: userService,
	}
}

// LoginRequest represents the expected form data in a login request
type LoginRequest struct {
	Username string
	Password string
	AuthID   string
}

// Execute handles the login form submission and authorization code generation
func (h *LoginHandler) Execute(w http.ResponseWriter, r *http.Request) {
	h.logger.Info("handling login request",
		"method", r.Method,
		"path", r.URL.Path)

	// Verify this is a POST request
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse the login form
	if err := r.ParseForm(); err != nil {
		h.logger.Error("failed to parse form",
			"error", err)
		http.Error(w, "Invalid form data", http.StatusBadRequest)
		return
	}

	// Extract form data
	loginReq := LoginRequest{
		Username: r.FormValue("username"),
		Password: r.FormValue("password"),
		AuthID:   r.FormValue("auth_id"),
	}

	// Validate form data
	if loginReq.Username == "" || loginReq.Password == "" || loginReq.AuthID == "" {
		http.Error(w, "Missing required fields", http.StatusBadRequest)
		return
	}

	// Get the pending authorization request
	pendingAuth, err := h.authStore.GetPendingAuth(loginReq.AuthID)
	if err != nil {
		if errors.Is(err, oauth.ErrAuthorizationNotFound) {
			http.Error(w, "Invalid or expired authorization request", http.StatusBadRequest)
			return
		}
		h.logger.Error("failed to get pending authorization",
			"error", err,
			"auth_id", loginReq.AuthID)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// Validate user credentials
	valid, err := h.userService.ValidateCredentials(loginReq.Username, loginReq.Password)
	if err != nil {
		h.logger.Error("failed to validate credentials",
			"error", err,
			"username", loginReq.Username)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	if !valid {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	// Generate authorization code
	code := generateRandomString(32)
	authCode := oauth.AuthorizationCode{
		Code:        code,
		ClientID:    pendingAuth.ClientID,
		RedirectURI: pendingAuth.RedirectURI,
		UserID:      loginReq.Username,
		Scope:       pendingAuth.Scope,
		ExpiresAt:   time.Now().Add(10 * time.Minute),
	}

	// Store the authorization code
	if err := h.authStore.StoreAuthorizationCode(code, authCode); err != nil {
		h.logger.Error("failed to store authorization code",
			"error", err,
			"client_id", pendingAuth.ClientID)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// Clean up the pending authorization
	if err := h.authStore.DeletePendingAuth(loginReq.AuthID); err != nil {
		h.logger.Error("failed to delete pending authorization",
			"error", err,
			"auth_id", loginReq.AuthID)
		// Continue with the flow as this is not critical
	}

	// Build the redirect URL with the authorization code
	redirectURL := fmt.Sprintf("%s?code=%s", pendingAuth.RedirectURI, code)
	if pendingAuth.State != "" {
		redirectURL += fmt.Sprintf("&state=%s", pendingAuth.State)
	}

	// Redirect back to the client application
	http.Redirect(w, r, redirectURL, http.StatusFound)
}
