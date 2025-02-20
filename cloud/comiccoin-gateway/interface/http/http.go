// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/interface/http/http.go
package http

import (
	"log"
	"log/slog"
	"net/http"

	"github.com/rs/cors"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/interface/http/handler"
	http_identity "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/interface/http/identity"
	mid "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/interface/http/middleware"
	http_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/interface/http/oauth"
	http_usr "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/interface/http/user"
)

// HTTPServer represents an HTTP server that handles incoming requests.
type HTTPServer interface {
	// Run starts the HTTP server.
	Run()

	// Shutdown shuts down the HTTP server.
	Shutdown()
}

// httpServerImpl is an implementation of the HTTPServer interface.
type httpServerImpl struct {
	// cfg is the configuration for the HTTP server.
	cfg *config.Configuration

	// logger is the logger for the HTTP server.
	logger *slog.Logger

	middleware mid.Middleware

	// server is the underlying HTTP server.
	server *http.Server

	getVersionHTTPHandler *handler.GetVersionHTTPHandler

	getHealthCheckHTTPHandler *handler.GetHealthCheckHTTPHandler

	authorizeHandler     *http_oauth.AuthorizeHandler
	loginHandler         *http_oauth.LoginHandler
	tokenHandler         *http_oauth.TokenHandler
	introspectionHandler *http_oauth.IntrospectionHandler
	refreshTokenHandler  *http_oauth.RefreshTokenHandler

	registerHandler    *http_usr.RegisterHandler
	getIdentityHandler *http_identity.GetIdentityHandler
}

// NewHTTPServer creates a new HTTP server instance.
func NewHTTPServer(
	cfg *config.Configuration,
	logger *slog.Logger,
	mid mid.Middleware,
	h1 *handler.GetVersionHTTPHandler,
	h2 *handler.GetHealthCheckHTTPHandler,

	authorizeHandler *http_oauth.AuthorizeHandler,
	loginHandler *http_oauth.LoginHandler,
	tokenHandler *http_oauth.TokenHandler,
	introspectionHandler *http_oauth.IntrospectionHandler,
	refreshTokenHandler *http_oauth.RefreshTokenHandler,

	registerHandler *http_usr.RegisterHandler,
	getIdentityHandler *http_identity.GetIdentityHandler,
) HTTPServer {
	// Check if the HTTP address is set in the configuration.
	if cfg.App.HTTPAddress == "" {
		log.Fatal("missing http address")
	}

	// Initialize the ServeMux.
	mux := http.NewServeMux()

	// Set up CORS middleware to allow all origins.
	corsHandler := cors.AllowAll().Handler(mux)

	// Bind the HTTP server to the assigned address and port.
	srv := &http.Server{
		Addr:    cfg.App.HTTPAddress,
		Handler: corsHandler,
	}

	// Create a new HTTP server instance.
	port := &httpServerImpl{
		cfg:                       cfg,
		logger:                    logger,
		middleware:                mid,
		server:                    srv,
		getVersionHTTPHandler:     h1,
		getHealthCheckHTTPHandler: h2,
		authorizeHandler:          authorizeHandler,
		loginHandler:              loginHandler,
		tokenHandler:              tokenHandler,
		introspectionHandler:      introspectionHandler,
		refreshTokenHandler:       refreshTokenHandler,
		registerHandler:           registerHandler,
		getIdentityHandler:        getIdentityHandler,
	}
	// Attach the HTTP server controller to the ServeMux.
	mux.HandleFunc("/", mid.Attach(port.HandleRequests))

	return port
}

// Run starts the HTTP server.
func (port *httpServerImpl) Run() {
	// Log a message to indicate that the HTTP server is running.
	port.logger.Info("Running HTTP JSON API",
		slog.String("listen_address", port.cfg.App.HTTPAddress))

	// Start the HTTP server.
	if err := port.server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		// Log an error message if the server fails to start.
		port.logger.Error("listen failed", slog.Any("error", err))

		// Terminate the application if the server fails to start.
		log.Fatalf("failed to listen and server: %v", err)
	}
}

// Shutdown shuts down the HTTP server.
func (port *httpServerImpl) Shutdown() {
	// Log a message to indicate that the HTTP server is shutting down.
	port.logger.Info("Gracefully shutting down HTTP JSON API")

	port.middleware.Shutdown()
}

// HandleRequests handles incoming HTTP requests.
func (port *httpServerImpl) HandleRequests(w http.ResponseWriter, r *http.Request) {
	// Get the URL path tokens from the request context.
	ctx := r.Context()
	p := ctx.Value("url_split").([]string)
	n := len(p)

	// Log a message to indicate that a request has been received.
	// But only do this if client is attempting to access our API endpoints.
	if n > 2 {
		port.logger.Debug("",
			slog.Any("method", r.Method),
			slog.Any("url_tokens", p),
			slog.Int("url_token_count", n))
	}

	// Handle the request based on the URL path tokens.
	switch {
	case n == 1 && p[0] == "version" && r.Method == http.MethodGet:
		port.getVersionHTTPHandler.Execute(w, r)
	case n == 1 && p[0] == "health-check" && r.Method == http.MethodGet:
		port.getHealthCheckHTTPHandler.Execute(w, r)
	case n == 2 && p[0] == "oauth" && p[1] == "authorize" && r.Method == http.MethodGet:
		port.authorizeHandler.Execute(w, r)
	case n == 2 && p[0] == "oauth" && p[1] == "login" && r.Method == http.MethodPost:
		port.loginHandler.Execute(w, r)
	case n == 2 && p[0] == "oauth" && p[1] == "token" && r.Method == http.MethodPost:
		port.tokenHandler.Execute(w, r)
	case n == 2 && p[0] == "oauth" && p[1] == "refresh" && r.Method == http.MethodPost:
		port.refreshTokenHandler.Execute(w, r)
	case n == 2 && p[0] == "oauth" && p[1] == "introspect" && r.Method == http.MethodPost:
		port.introspectionHandler.Execute(w, r)
	case n == 2 && p[0] == "api" && p[1] == "register":
		port.registerHandler.Execute(w, r)
	case n == 2 && p[0] == "api" && p[1] == "identity" && r.Method == http.MethodGet:
		port.getIdentityHandler.Execute(w, r)

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
}
