// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/interface/http/oauth/authorize.go
package oauth

import (
	"errors"
	"fmt"
	"html/template"
	"log/slog"
	"net/http"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/httperror"
	base_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/security/oauth"
	svc_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/service/oauth"
)

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
    </style>
</head>
<body>
    <div class="container">
        <form method="POST" action="/oauth/login">
            <input type="hidden" name="success_uri" value="{{.SuccessURI}}">
            <input type="hidden" name="auth_id" value="{{.AuthID}}">
	        <input type="hidden" name="state" value="{{.State}}">
            <div class="form-group">
                <label>Client: {{.ClientID}}</label>
            </div>
            <div class="form-group">
                <label>Scope: {{.Scope}}</label>
            </div>
            <div class="form-group">
                <label for="username">Username:</label>
                <input type="text" id="username" name="username" value="test@test.com" required>
            </div>
            <div class="form-group">
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" value="123password" required>
            </div>
            <button type="submit">Authorize</button>
        </form>
    </div>
</body>
</html>
`

type AuthorizeHandler struct {
	logger           *slog.Logger
	authorizeService svc_oauth.AuthorizeService
	loginTemplate    *template.Template
}

func NewAuthorizeHandler(
	logger *slog.Logger,
	authorizeService svc_oauth.AuthorizeService,
) *AuthorizeHandler {
	tmpl := template.Must(template.New("login").Parse(loginFormTemplate))
	return &AuthorizeHandler{
		logger:           logger,
		authorizeService: authorizeService,
		loginTemplate:    tmpl,
	}
}

func (h *AuthorizeHandler) Execute(w http.ResponseWriter, r *http.Request) {
	h.logger.Info("handling authorize request",
		"method", r.Method,
		"path", r.URL.Path)

	// Extract query parameters
	clientID := r.URL.Query().Get("client_id")
	redirectURI := r.URL.Query().Get("redirect_uri")
	successURI := r.URL.Query().Get("success_uri")
	responseType := r.URL.Query().Get("response_type")
	state := r.URL.Query().Get("state")
	scope := r.URL.Query().Get("scope")

	// Validation
	if clientID == "" {
		h.logger.Error("missing required `client_id` value")
		httperror.ResponseError(w, httperror.NewForBadRequestWithSingleField("client_id", "required value"))
		return
	}
	if redirectURI == "" {
		h.logger.Error("missing required `redirect_uri` value")
		httperror.ResponseError(w, httperror.NewForBadRequestWithSingleField("redirect_uri", "required value"))
		return
	}
	if successURI == "" {
		h.logger.Error("missing required `success_uri` value")
		httperror.ResponseError(w, httperror.NewForBadRequestWithSingleField("success_uri", "required value"))
		return
	}
	if responseType == "" {
		h.logger.Error("missing required `response_type` value")
		httperror.ResponseError(w, httperror.NewForBadRequestWithSingleField("response_type", "required value"))
		return
	}
	if state == "" {
		h.logger.Error("missing required `state` value")
		httperror.ResponseError(w, httperror.NewForBadRequestWithSingleField("state", "required value"))
		return
	}
	if scope == "" {
		h.logger.Error("missing required `scope` value")
		httperror.ResponseError(w, httperror.NewForBadRequestWithSingleField("scope", "required value"))
		return
	}

	// Validate the request parameters using our service - note we pass individual parameters now
	if err := h.authorizeService.ValidateAuthorizationRequest(
		r.Context(),
		clientID,
		redirectURI,
		responseType,
		state,
		scope,
	); err != nil {
		var validationErr *base_oauth.ValidationError
		if errors.As(err, &validationErr) {
			h.handleValidationError(w, r, validationErr)
			return
		}

		h.logger.Error("internal server error",
			"error", err,
			"client_id", clientID)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// Create a pending authorization using our service - note we pass individual parameters now
	authID, err := h.authorizeService.CreatePendingAuthorization(
		r.Context(),
		clientID,
		redirectURI,
		state,
		scope,
	)
	if err != nil {
		h.logger.Error("failed to create pending authorization",
			"error", err,
			"client_id", clientID)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	if authID == "" {
		h.logger.Error("internal server error - failed to generate `auth_id` ",
			"error", err,
			"client_id", clientID)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// Prepare the data for the login template
	data := struct {
		SuccessURI string
		ClientID   string
		AuthID     string
		Scope      string
		State      string
	}{
		SuccessURI: successURI,
		ClientID:   clientID,
		AuthID:     authID,
		Scope:      scope,
		State:      state,
	}

	// Render the login form
	if err := h.loginTemplate.Execute(w, data); err != nil {
		h.logger.Error("failed to render template",
			"error", err,
			"client_id", clientID)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
}

func (h *AuthorizeHandler) handleValidationError(w http.ResponseWriter, r *http.Request, ve *base_oauth.ValidationError) {
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
