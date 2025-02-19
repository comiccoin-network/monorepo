// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/interface/http/oauth/authorize.go
package oauth

import (
	"errors"
	"fmt"
	"html/template"
	"log/slog"
	"net/http"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	base_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/oauth"
	svc_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/service/oauth"
)

const loginFormTemplate = `
<!DOCTYPE html>
<html>
<head>
    <title>OAuth 2.0 Authorization</title>
	<style>
        /* Reset and base styles */
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        /* Create full-height gradient background matching platform */
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: linear-gradient(135deg, #6949FF 0%, #876BFF 100%);
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        /* Main card container with consistent shadow and radius */
        .container {
            background-color: white;
            width: 100%;
            max-width: 480px;
            padding: 32px;
            border-radius: 24px;
            box-shadow: 0 4px 24px rgba(26, 21, 35, 0.08);
        }

        /* Typography matching platform */
        h1 {
            font-size: 24px;
            font-weight: 600;
            color: #1A1523;
            margin: 0 0 8px 0;
            text-align: center;
        }

        .subtitle {
            font-size: 14px;
            color: #6B7280;
            text-align: center;
            margin-bottom: 32px;
        }

        /* Application info section */
        .app-info {
            background-color: #F9FAFB;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 24px;
        }

        .app-info-item {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
        }

        .app-info-item:last-child {
            margin-bottom: 0;
        }

        .app-info-label {
            font-size: 14px;
            color: #6B7280;
            width: 100px;
        }

        .app-info-value {
            font-size: 14px;
            color: #1A1523;
            font-weight: 500;
        }

        /* Form styling */
        .form-group {
            margin-bottom: 20px;
        }

        label {
            display: block;
            font-size: 14px;
            font-weight: 500;
            color: #374151;
            margin-bottom: 6px;
        }

        input {
            width: 100%;
            padding: 12px;
            border: 1px solid #E5E7EB;
            border-radius: 12px;
            font-size: 15px;
            transition: all 0.2s ease;
            background-color: #F9FAFB;
        }

        input:focus {
            outline: none;
            border-color: #6949FF;
            background-color: #FFFFFF;
            box-shadow: 0 0 0 4px rgba(105, 73, 255, 0.1);
        }

        /* Submit button */
        button {
            width: 100%;
            background: #6949FF;
            color: white;
            padding: 12px;
            border: none;
            border-radius: 12px;
            font-weight: 500;
            font-size: 15px;
            cursor: pointer;
            transition: background-color 0.2s ease;
            margin-top: 8px;
        }

        button:hover {
            background: #5538E2;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Sign in to ComicCoin Network</h1>
        <p class="subtitle">Continue to {{.ClientID}}</p>

        <div class="app-info">
            <div class="app-info-item">
                <span class="app-info-label">Application</span>
                <span class="app-info-value">{{.ClientID}}</span>
            </div>
            <div class="app-info-item">
                <span class="app-info-label">Permissions</span>
                <span class="app-info-value">{{.Scope}}</span>
            </div>
        </div>

        <form method="POST" action="/gateway/api/v1/oauth/login">
            <input type="hidden" name="success_uri" value="{{.SuccessURI}}">
            <input type="hidden" name="auth_id" value="{{.AuthID}}">
            <input type="hidden" name="state" value="{{.State}}">

            <div class="form-group">
                <label for="username">Email Address</label>
                <input
                    type="email"
                    id="username"
                    name="username"
                    required
                    autocomplete="email">
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    autocomplete="current-password">
            </div>

            <button type="submit">Sign In & Authorize</button>
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
