package unifiedhttp

import (
	"fmt"
	"log"
	"log/slog"
	"net/http"

	"github.com/rs/cors"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	authority_http "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/interface/http"
	gateway_http "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/interface/http"
	mid "github.com/comiccoin-network/monorepo/cloud/comiccoin/unifiedhttp/middleware"
)

type UnifiedHTTPServer interface {
	Run()
	Shutdown()
}

type unifiedHTTPServerImpl struct {
	// cfg is the configuration for the HTTP server.
	cfg *config.Configuration

	logger     *slog.Logger
	server     *http.Server
	middleware mid.Middleware

	// System
	getVersionHTTPHandler     *GetVersionHTTPHandler
	getHealthCheckHTTPHandler *GetHealthCheckHTTPHandler

	// Modules
	authorityHTTPServer authority_http.HTTPServer
	gatewayHTTPServer   gateway_http.HTTPServer
}

func NewUnifiedHTTPServer(
	cfg *config.Configuration,
	logger *slog.Logger,
	mid mid.Middleware,
	authorityHTTPServer authority_http.HTTPServer,
	gatewayHTTPServer gateway_http.HTTPServer,
) UnifiedHTTPServer {
	// Check if the HTTP address is set in the configuration.
	if cfg.App.IP == "" {
		log.Fatal("http server missing ip address")
	}
	if cfg.App.Port == "" {
		log.Fatal("http server missing port number")
	}

	// Initialize the ServeMux.
	mux := http.NewServeMux()

	// Set up CORS middleware to allow all origins.
	handler := cors.AllowAll().Handler(mux)

	// Bind the HTTP server to the assigned address and port.
	srv := &http.Server{
		Addr:    fmt.Sprintf("%v:%v", cfg.App.IP, cfg.App.Port),
		Handler: handler,
	}

	port := &unifiedHTTPServerImpl{
		cfg:                       cfg,
		logger:                    logger,
		server:                    srv,
		middleware:                mid,
		getVersionHTTPHandler:     NewGetVersionHTTPHandler(logger),
		getHealthCheckHTTPHandler: NewGetHealthCheckHTTPHandler(logger),
		authorityHTTPServer:       authorityHTTPServer,
		gatewayHTTPServer:         gatewayHTTPServer,
	}

	// Attach the unified request handler
	mux.HandleFunc("/", mid.Attach(port.handleRequests))

	return port
}

// Run starts the HTTP server.
func (port *unifiedHTTPServerImpl) Run() {
	// Log a message to indicate that the HTTP server is running.
	port.logger.Info("Running HTTP JSON API",
		slog.String("listen_address", fmt.Sprintf("%v:%v", port.cfg.App.IP, port.cfg.App.Port)))

	// Start the HTTP server.
	if err := port.server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		// Log an error message if the server fails to start.
		port.logger.Error("listen failed", slog.Any("error", err))

		// Terminate the application if the server fails to start.
		log.Fatalf("failed to listen and server: %v", err)
	}
}

// Shutdown shuts down the HTTP server.
func (port *unifiedHTTPServerImpl) Shutdown() {
	// Log a message to indicate that the HTTP server is shutting down.
	port.logger.Info("Gracefully shutting down HTTP JSON API")

	// port.middleware.Shutdown()
}

// HandleRequests handles incoming HTTP requests.
func (port *unifiedHTTPServerImpl) handleRequests(w http.ResponseWriter, r *http.Request) {
	// Set the content type of the response to application/json.
	w.Header().Set("Content-Type", "application/json")

	// Get the URL path tokens from the request context.
	ctx := r.Context()
	p, ok := ctx.Value("url_split").([]string)
	if !ok {
		log.Fatal("did not do url-split")
	}
	n := len(p)

	// Log a message to indicate that a request has been received.
	// But only do this if client is attempting to access our API endpoints.
	if n > 2 {
		port.logger.Debug("",
			slog.Any("method", r.Method),
			slog.Any("url_tokens", p),
			slog.Int("url_token_count", n))
	}

	// Handle new API endpoints.
	if n > 3 {
		if p[2] == "authority" {
			port.authorityHTTPServer.HandleIncomingHTTPRequest(w, r)
			return
		}
		if p[2] == "gateway" {
			port.gatewayHTTPServer.HandleIncomingHTTPRequest(w, r)
			return
		}
	}

	// Handle the request based on the URL path tokens.
	switch {
	case n == 1 && p[0] == "version" && r.Method == http.MethodGet:
		port.getVersionHTTPHandler.Execute(w, r)

	case n == 1 && p[0] == "health-check" && r.Method == http.MethodGet:
		port.getHealthCheckHTTPHandler.Execute(w, r)

	// --- CATCH ALL: D.N.E. ---
	default:
		// DEVELOPERS NOTE:
		// Because we have code actively running using the old authority
		// paths, we will have those paths be handled. In the future once
		// all the dependent code has been migrated to the `/authority/`
		// url then we can remove the code below. Until then leave it. To
		// remove it, the following needs to be updated:
		// - comiccoin-webwallet
		// - comiccoin-wallet
		// - comiccoin-cli
		// - comiccoin-nftminter
		// - comiccoin-gateway

		port.authorityHTTPServer.HandleIncomingDeprecatedPathHTTPRequest(w, r)
	}
}
