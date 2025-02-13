// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/interface/http/http.go
package http

import (
	"log"
	"log/slog"
	"net/http"

	"github.com/rs/cors"

	common_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/config"

	// http_introspection "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/interface/http/introspection"
	// http_login "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/interface/http/login"
	mid "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/interface/http/middleware"
	http_system "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/interface/http/system"

	// http_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/interface/http/oauth"
	// http_registration "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/interface/http/registration"
	// http_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/interface/http/token"
	http_hello "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/interface/http/hello"
	http_me "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/interface/http/me"
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

	// Remote oAuth 2.0 connection handler.
	oauthClientManager common_oauth.Manager

	middleware mid.Middleware

	// server is the underlying HTTP server.
	server *http.Server

	// Core handlers
	getVersionHTTPHandler     *http_system.GetVersionHTTPHandler
	getHealthCheckHTTPHandler *http_system.GetHealthCheckHTTPHandler

	// Resources
	getHelloHTTPHandler *http_hello.GetHelloHTTPHandler

	getMeHTTPHandler *http_me.GetMeHTTPHandler
}

// NewHTTPServer creates a new HTTP server instance.
func NewHTTPServer(
	cfg *config.Configuration,
	logger *slog.Logger,
	manager common_oauth.Manager,
	mid mid.Middleware,
	getVersionHTTPHandler *http_system.GetVersionHTTPHandler,
	getHealthCheckHTTPHandler *http_system.GetHealthCheckHTTPHandler,
	getHelloHTTPHandler *http_hello.GetHelloHTTPHandler,
	getMeHTTPHandler *http_me.GetMeHTTPHandler,
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
		oauthClientManager:        manager,
		middleware:                mid,
		server:                    srv,
		getVersionHTTPHandler:     getVersionHTTPHandler,
		getHealthCheckHTTPHandler: getHealthCheckHTTPHandler,
		getHelloHTTPHandler:       getHelloHTTPHandler,
		getMeHTTPHandler:          getMeHTTPHandler,
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
	// System endpoints
	case n == 1 && p[0] == "version" && r.Method == http.MethodGet:
		port.getVersionHTTPHandler.Execute(w, r)
	case n == 1 && p[0] == "health-check" && r.Method == http.MethodGet:
		port.getHealthCheckHTTPHandler.Execute(w, r)

	// Auth endpoints
	case n == 2 && p[0] == "api" && p[1] == "register":
		port.oauthClientManager.PostRegistrationHTTPHandler().Execute(w, r)
	case n == 2 && p[0] == "api" && p[1] == "login" && r.Method == http.MethodPost:
		port.oauthClientManager.PostLoginHTTPHandler().Execute(w, r)

	// Token endpoints
	case n == 3 && p[0] == "api" && p[1] == "token" && p[2] == "refresh" && r.Method == http.MethodPost:
		port.oauthClientManager.PostTokenRefreshHTTPHandler().Execute(w, r)
	case n == 3 && p[0] == "api" && p[1] == "token" && p[2] == "introspect" && r.Method == http.MethodPost:
		port.oauthClientManager.PostTokenIntrospectionHTTPHandler().Execute(w, r)

	// OAuth endpoints
	case n == 3 && p[0] == "api" && p[1] == "oauth" && p[2] == "authorize" && r.Method == http.MethodGet:
		port.oauthClientManager.GetAuthURLHTTPHandler().Execute(w, r)
	case n == 3 && p[0] == "api" && p[1] == "oauth" && p[2] == "callback" && r.Method == http.MethodGet:
		port.oauthClientManager.CallbackHTTPHandler().Execute(w, r)
	case n == 3 && p[0] == "api" && p[1] == "oauth" && p[2] == "state" && r.Method == http.MethodGet:
		port.oauthClientManager.StateManagementHTTPHandler().VerifyState(w, r)
	case n == 3 && p[0] == "api" && p[1] == "oauth" && p[2] == "state" && r.Method == http.MethodDelete:
		port.oauthClientManager.StateManagementHTTPHandler().CleanupExpiredStates(w, r)
	case n == 3 && p[0] == "api" && p[1] == "oauth" && p[2] == "session" && r.Method == http.MethodGet:
		port.oauthClientManager.OAuthSessionInfoHTTPHandler().Execute(w, r)
	case n == 3 && p[0] == "api" && p[1] == "oauth" && p[2] == "registration" && r.Method == http.MethodGet: // Used by frontend
		port.oauthClientManager.GetRegistrationURLHTTPHandler().Execute(w, r)

	// Resources
	case n == 2 && p[0] == "api" && p[1] == "say-hello" && r.Method == http.MethodPost:
		port.getHelloHTTPHandler.Execute(w, r)
	case n == 2 && p[0] == "api" && p[1] == "me" && r.Method == http.MethodGet:
		port.getMeHTTPHandler.Execute(w, r)

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
