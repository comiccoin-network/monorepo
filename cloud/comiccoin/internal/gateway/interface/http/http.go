// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/interface/http/http.go
package http

import (
	"context"
	"log/slog"
	"net/http"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	http_fi "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/interface/http/federatedidentity"
	http_identity "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/interface/http/identity"
	mid "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/interface/http/middleware"
	http_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/interface/http/oauth"
)

// HTTPServer represents an HTTP server that handles incoming requests.
type HTTPServer interface {
	// HandleIncomingHTTPRequest method handles incoming HTTP requests.
	HandleIncomingHTTPRequest(w http.ResponseWriter, r *http.Request)

	// Shutdown shuts down the HTTP server.
	Shutdown(ctx context.Context)
}

// httpServerImpl is an implementation of the HTTPServer interface.
type httpServerImpl struct {
	// cfg is the configuration for the HTTP server.
	cfg *config.Configuration

	// logger is the logger for the HTTP server.
	logger *slog.Logger

	middleware mid.Middleware

	authorizeHandler     *http_oauth.AuthorizeHandler
	loginHandler         *http_oauth.LoginHandler
	tokenHandler         *http_oauth.TokenHandler
	introspectionHandler *http_oauth.IntrospectionHandler
	refreshTokenHandler  *http_oauth.RefreshTokenHandler
	uiRegisterHandler    *http_oauth.UIRegisterHandler

	registerHandler                *http_fi.RegisterHandler
	getIdentityHandler             *http_identity.GetIdentityHandler
	updateFederatedIdentityHandler *http_fi.UpdateFederatedIdentityHandler
}

// NewHTTPServer creates a new HTTP server instance.
func NewHTTPServer(
	cfg *config.Configuration,
	logger *slog.Logger,
	mid mid.Middleware,

	authorizeHandler *http_oauth.AuthorizeHandler,
	loginHandler *http_oauth.LoginHandler,
	tokenHandler *http_oauth.TokenHandler,
	introspectionHandler *http_oauth.IntrospectionHandler,
	refreshTokenHandler *http_oauth.RefreshTokenHandler,

	registerHandler *http_fi.RegisterHandler,
	getIdentityHandler *http_identity.GetIdentityHandler,
	updateFederatedIdentityHandler *http_fi.UpdateFederatedIdentityHandler,
) HTTPServer {

	uiregister := http_oauth.NewUIRegisterHandler(logger)

	// Create a new HTTP server instance.
	port := &httpServerImpl{
		cfg:                            cfg,
		logger:                         logger,
		middleware:                     mid,
		authorizeHandler:               authorizeHandler,
		loginHandler:                   loginHandler,
		tokenHandler:                   tokenHandler,
		introspectionHandler:           introspectionHandler,
		refreshTokenHandler:            refreshTokenHandler,
		uiRegisterHandler:              uiregister,
		registerHandler:                registerHandler,
		getIdentityHandler:             getIdentityHandler,
		updateFederatedIdentityHandler: updateFederatedIdentityHandler,
	}

	return port
}

// Shutdown shuts down the HTTP server.
func (port *httpServerImpl) Shutdown(ctx context.Context) {
	// Log a message to indicate that the HTTP server is shutting down.
	port.logger.Info("Gracefully shutting down HTTP JSON API")

	port.middleware.Shutdown(ctx)
}

// HandleRequests handles incoming HTTP requests.
func (port *httpServerImpl) HandleIncomingHTTPRequest(w http.ResponseWriter, r *http.Request) {
	// Apply authority middleware
	handler := port.middleware.Attach(func(w http.ResponseWriter, r *http.Request) {

		// Get the URL path tokens from the request context.
		ctx := r.Context()
		p := ctx.Value("url_split").([]string)
		n := len(p)

		// Log a message to indicate that a request has been received.
		// But only do this if client is attempting to access our API endpoints.
		if n > 1 {
			port.logger.Debug("",
				slog.Any("method", r.Method),
				slog.Any("url_tokens", p),
				slog.Int("url_token_count", n))
		}

		// Handle the request based on the URL path tokens.
		switch {
		case n == 4 && p[0] == "gateway" && p[1] == "ui" && p[2] == "v1" && p[3] == "register" && r.Method == http.MethodGet:
			port.uiRegisterHandler.Execute(w, r)
		case n == 4 && p[0] == "gateway" && p[1] == "ui" && p[2] == "v1" && p[3] == "authorize-or-login" && r.Method == http.MethodGet:
			port.authorizeHandler.Execute(w, r)

		// DEVELOPERS NOTE: This is the form submission  API endpoiunt from the ui form.
		case n == 4 && p[0] == "gateway" && p[1] == "api" && p[2] == "v1" && p[3] == "register":
			port.registerHandler.Execute(w, r)

		case n == 5 && p[0] == "gateway" && p[1] == "api" && p[2] == "v1" && p[3] == "oauth" && p[4] == "login" && r.Method == http.MethodPost:
			port.loginHandler.Execute(w, r)
		case n == 5 && p[0] == "gateway" && p[1] == "api" && p[2] == "v1" && p[3] == "oauth" && p[4] == "token" && r.Method == http.MethodPost:
			port.tokenHandler.Execute(w, r)

		case n == 5 && p[0] == "gateway" && p[1] == "api" && p[2] == "v1" && p[3] == "oauth" && p[4] == "refresh" && r.Method == http.MethodPost:
			port.refreshTokenHandler.Execute(w, r)
		case n == 5 && p[0] == "gateway" && p[1] == "api" && p[2] == "v1" && p[3] == "oauth" && p[4] == "introspect" && r.Method == http.MethodPost:
			port.introspectionHandler.Execute(w, r)

		case n == 5 && p[0] == "gateway" && p[1] == "api" && p[2] == "v1" && p[3] == "resources" && p[4] == "identity" && r.Method == http.MethodGet: // DEPRECATED URL
			port.getIdentityHandler.Execute(w, r)
		case n == 5 && p[0] == "gateway" && p[1] == "api" && p[2] == "v1" && p[3] == "resources" && p[4] == "federated-identity" && r.Method == http.MethodGet:
			port.getIdentityHandler.Execute(w, r)
		case n == 5 && p[0] == "gateway" && p[1] == "api" && p[2] == "v1" && p[3] == "resources" && p[4] == "federated-identity" && r.Method == http.MethodPost:
			port.updateFederatedIdentityHandler.Execute(w, r)

			// --- CATCH ALL: D.N.E. ---
		default:
			// Log a message to indicate that the request is not found.
			port.logger.Debug("404 request",
				slog.Any("method", r.Method),
				slog.Any("url_tokens", p),
				slog.Int("url_token_count", n),
			)

			// Return a 404 response.
			http.NotFound(w, r)
		}
	})
	handler(w, r)
}
