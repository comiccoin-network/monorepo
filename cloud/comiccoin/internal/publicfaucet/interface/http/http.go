// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/interface/http/http.go
package http

import (
	"context"
	"log/slog"
	"net/http"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	common_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient"

	// http_introspection "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/interface/http/introspection"
	// http_login "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/interface/http/login"
	mid "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/interface/http/middleware"
	http_system "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/interface/http/system"

	// http_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/interface/http/oauth"
	// http_registration "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/interface/http/registration"
	// http_token "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/interface/http/token"
	http_dashboard "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/interface/http/dashboard"
	http_faucet "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/interface/http/faucet"
	http_hello "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/interface/http/hello"
	http_me "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/interface/http/me"
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

	// Remote oAuth 2.0 connection handler.
	oauthClientManager common_oauth.Manager

	middleware mid.Middleware

	// Core handlers
	getVersionHTTPHandler     *http_system.GetVersionHTTPHandler
	getHealthCheckHTTPHandler *http_system.GetHealthCheckHTTPHandler

	// Resources
	getHelloHTTPHandler *http_hello.GetHelloHTTPHandler

	getMeHTTPHandler               *http_me.GetMeHTTPHandler
	postMeConnectWalletHTTPHandler *http_me.PostMeConnectWalletHTTPHandler

	getFaucetByChainID                *http_faucet.GetFaucetByChainIDHTTPHandler
	faucetServerSentEventsHTTPHandler *http_faucet.FaucetServerSentEventsHTTPHandler

	dashboard *http_dashboard.DashboardHTTPHandler
}

// NewHTTPServer creates a new HTTP server instance.
func NewHTTPServer(
	cfg *config.Configuration,
	logger *slog.Logger,
	manager common_oauth.Manager,
	mid mid.Middleware,
	getHelloHTTPHandler *http_hello.GetHelloHTTPHandler,
	getMeHTTPHandler *http_me.GetMeHTTPHandler,
	postMeConnectWalletHTTPHandler *http_me.PostMeConnectWalletHTTPHandler,
	getFaucetByChainID *http_faucet.GetFaucetByChainIDHTTPHandler,
	faucetServerSentEventsHTTPHandler *http_faucet.FaucetServerSentEventsHTTPHandler,
	dashboard *http_dashboard.DashboardHTTPHandler,
) HTTPServer {

	// Create a new HTTP server instance.
	port := &httpServerImpl{
		cfg:                               cfg,
		logger:                            logger,
		oauthClientManager:                manager,
		middleware:                        mid,
		getHelloHTTPHandler:               getHelloHTTPHandler,
		getMeHTTPHandler:                  getMeHTTPHandler,
		postMeConnectWalletHTTPHandler:    postMeConnectWalletHTTPHandler,
		getFaucetByChainID:                getFaucetByChainID,
		faucetServerSentEventsHTTPHandler: faucetServerSentEventsHTTPHandler,
		dashboard:                         dashboard,
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
		if n > 2 {
			port.logger.Debug("",
				slog.Any("method", r.Method),
				slog.Any("url_tokens", p),
				slog.Int("url_token_count", n))
		}

		// Handle the request based on the URL path tokens.
		switch {
		// --- Auth endpoints ---
		case n == 4 && p[0] == "publicfaucet" && p[1] == "api" && p[2] == "v1" && p[3] == "register":
			port.oauthClientManager.PostRegistrationHTTPHandler().Execute(w, r)
		case n == 4 && p[0] == "publicfaucet" && p[1] == "api" && p[2] == "publicfaucet" && p[3] == "login" && r.Method == http.MethodPost:
			port.oauthClientManager.PostLoginHTTPHandler().Execute(w, r)

			// --- Token endpoints ---
		case n == 5 && p[0] == "publicfaucet" && p[1] == "api" && p[2] == "v1" && p[3] == "token" && p[4] == "refresh" && r.Method == http.MethodPost:
			port.oauthClientManager.PostTokenRefreshHTTPHandler().Execute(w, r)
		case n == 5 && p[0] == "publicfaucet" && p[1] == "api" && p[2] == "v1" && p[3] == "token" && p[4] == "introspect" && r.Method == http.MethodPost:
			port.oauthClientManager.PostTokenIntrospectionHTTPHandler().Execute(w, r)

		// --- oAuth endpoints ---
		case n == 5 && p[0] == "publicfaucet" && p[1] == "api" && p[2] == "v1" && p[3] == "oauth" && p[4] == "authorize" && r.Method == http.MethodGet:
			port.oauthClientManager.GetAuthURLHTTPHandler().Execute(w, r)
		case n == 5 && p[0] == "publicfaucet" && p[1] == "api" && p[2] == "v1" && p[3] == "oauth" && p[4] == "callback" && r.Method == http.MethodGet:
			port.oauthClientManager.CallbackHTTPHandler().Execute(w, r)
		case n == 5 && p[0] == "publicfaucet" && p[1] == "api" && p[2] == "v1" && p[3] == "oauth" && p[4] == "state" && r.Method == http.MethodGet:
			port.oauthClientManager.StateManagementHTTPHandler().VerifyState(w, r)
		case n == 5 && p[0] == "publicfaucet" && p[1] == "api" && p[2] == "v1" && p[3] == "oauth" && p[4] == "state" && r.Method == http.MethodDelete:
			port.oauthClientManager.StateManagementHTTPHandler().CleanupExpiredStates(w, r)
		case n == 5 && p[0] == "publicfaucet" && p[1] == "api" && p[2] == "v1" && p[3] == "oauth" && p[4] == "session" && r.Method == http.MethodGet:
			port.oauthClientManager.OAuthSessionInfoHTTPHandler().Execute(w, r)
		case n == 5 && p[0] == "publicfaucet" && p[1] == "api" && p[2] == "v1" && p[3] == "oauth" && p[4] == "registration" && r.Method == http.MethodGet: // Used by frontend
			port.oauthClientManager.GetRegistrationURLHTTPHandler().Execute(w, r)

		// --- Resource endpoints ---
		// Hello
		case n == 4 && p[0] == "publicfaucet" && p[1] == "api" && p[2] == "v1" && p[3] == "say-hello" && r.Method == http.MethodPost:
			port.getHelloHTTPHandler.Execute(w, r)

		// Me
		case n == 4 && p[0] == "publicfaucet" && p[1] == "api" && p[2] == "v1" && p[3] == "me" && r.Method == http.MethodGet:
			port.getMeHTTPHandler.Execute(w, r)
		case n == 5 && p[0] == "publicfaucet" && p[1] == "api" && p[2] == "v1" && p[3] == "me" && p[4] == "connect-wallet" && r.Method == http.MethodPost:
			port.postMeConnectWalletHTTPHandler.Execute(w, r)

		// Faucet
		case n == 5 && p[0] == "publicfaucet" && p[1] == "api" && p[2] == "v1" && p[3] == "faucet" && r.Method == http.MethodGet:
			port.getFaucetByChainID.Execute(w, r, p[4])

		// Dashboard
		case n == 4 && p[0] == "publicfaucet" && p[1] == "api" && p[2] == "v1" && p[3] == "dashboard" && r.Method == http.MethodGet:
			port.dashboard.Execute(w, r)

		// DEVELOPERS NOTE: Using `POST` method to get it working on DigitalOcean App Platform, see more for details:
		// "Does App Platform support SSE (Server-Sent Events) application?" via https://www.digitalocean.com/community/questions/does-app-platform-support-sse-server-sent-events-application
		case n == 5 && p[0] == "publicfaucet" && p[1] == "api" && p[2] == "v1" && p[3] == "faucet" && p[4] == "sse" && r.Method == http.MethodPost:
			port.faucetServerSentEventsHTTPHandler.Execute(w, r)

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
