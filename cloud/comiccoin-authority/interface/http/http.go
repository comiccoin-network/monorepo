package http

import (
	"fmt"
	"log"
	"log/slog"
	"net/http"

	"github.com/rs/cors"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/interface/http/handler"
	mid "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/interface/http/middleware"
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

	getVersionHTTPHandler                                     *handler.GetVersionHTTPHandler
	getHealthCheckHTTPHandler                                 *handler.GetHealthCheckHTTPHandler
	getGenesisBlockDataHTTPHandler                            *handler.GetGenesisBlockDataHTTPHandler
	getBlockchainStateHTTPHandler                             *handler.GetBlockchainStateHTTPHandler
	getBlockDataHTTPHandler                                   *handler.GetBlockDataHTTPHandler
	listBlockTransactionsByAddressHTTPHandler                 *handler.ListBlockTransactionsByAddressHTTPHandler
	signedTransactionSubmissionHTTPHandler                    *handler.SignedTransactionSubmissionHTTPHandler
	mempoolTransactionReceiveDTOFromNetworkServiceHTTPHandler *handler.MempoolTransactionReceiveDTOFromNetworkServiceHTTPHandler
	blockchainStateChangeEventDTOHTTPHandler                  *handler.BlockchainStateChangeEventDTOHTTPHandler
	blockchainStateServerSentEventsHTTPHandler                *handler.BlockchainStateServerSentEventsHTTPHandler
	tokenListByOwnerHTTPHandler                               *handler.TokenListByOwnerHTTPHandler
	tokenMintServiceHTTPHandler                               *handler.TokenMintServiceHTTPHandler
}

// NewHTTPServer creates a new HTTP server instance.
func NewHTTPServer(
	cfg *config.Configuration,
	logger *slog.Logger,
	mid mid.Middleware,
	http1 *handler.GetVersionHTTPHandler,
	http2 *handler.GetHealthCheckHTTPHandler,
	http3 *handler.GetGenesisBlockDataHTTPHandler,
	http4 *handler.GetBlockchainStateHTTPHandler,
	http5 *handler.ListBlockTransactionsByAddressHTTPHandler,
	http6 *handler.BlockchainStateChangeEventDTOHTTPHandler,
	http7 *handler.BlockchainStateServerSentEventsHTTPHandler,
	http8 *handler.GetBlockDataHTTPHandler,
	http9 *handler.SignedTransactionSubmissionHTTPHandler,
	http10 *handler.MempoolTransactionReceiveDTOFromNetworkServiceHTTPHandler,
	http11 *handler.TokenListByOwnerHTTPHandler,
	http12 *handler.TokenMintServiceHTTPHandler,
) HTTPServer {
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

	// Create a new HTTP server instance.
	port := &httpServerImpl{
		cfg:                            cfg,
		logger:                         logger,
		middleware:                     mid,
		server:                         srv,
		getVersionHTTPHandler:          http1,
		getHealthCheckHTTPHandler:      http2,
		getGenesisBlockDataHTTPHandler: http3,
		getBlockchainStateHTTPHandler:  http4,
		listBlockTransactionsByAddressHTTPHandler:                 http5,
		blockchainStateChangeEventDTOHTTPHandler:                  http6,
		blockchainStateServerSentEventsHTTPHandler:                http7,
		getBlockDataHTTPHandler:                                   http8,
		signedTransactionSubmissionHTTPHandler:                    http9,
		mempoolTransactionReceiveDTOFromNetworkServiceHTTPHandler: http10,
		tokenListByOwnerHTTPHandler:                               http11,
		tokenMintServiceHTTPHandler:                               http12,
	}

	// Attach the HTTP server controller to the ServeMux.
	mux.HandleFunc("/", mid.Attach(port.HandleRequests))

	return port
}

// Run starts the HTTP server.
func (port *httpServerImpl) Run() {
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
func (port *httpServerImpl) Shutdown() {
	// Log a message to indicate that the HTTP server is shutting down.
	port.logger.Info("Gracefully shutting down HTTP JSON API")

	port.middleware.Shutdown()
}

// HandleRequests handles incoming HTTP requests.
func (port *httpServerImpl) HandleRequests(w http.ResponseWriter, r *http.Request) {
	// Set the content type of the response to application/json.
	w.Header().Set("Content-Type", "application/json")

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

	case n == 3 && p[0] == "api" && p[1] == "v1" && p[2] == "genesis" && r.Method == http.MethodGet:
		port.getGenesisBlockDataHTTPHandler.Execute(w, r)

	case n == 3 && p[0] == "api" && p[1] == "v1" && p[2] == "blockchain-state" && r.Method == http.MethodGet:
		port.getBlockchainStateHTTPHandler.Execute(w, r)
	case n == 4 && p[0] == "api" && p[1] == "v1" && p[2] == "blockchain-state" && p[3] == "changes" && r.Method == http.MethodGet:
		port.blockchainStateChangeEventDTOHTTPHandler.Execute(w, r)

	// DEVELOPERS NOTE: Using `POST` method to get it working on DigitalOcean App Platform, see more for details:
	// "Does App Platform support SSE (Server-Sent Events) application?" via https://www.digitalocean.com/community/questions/does-app-platform-support-sse-server-sent-events-application
	case n == 4 && p[0] == "api" && p[1] == "v1" && p[2] == "blockchain-state" && p[3] == "sse" && r.Method == http.MethodPost:
		port.blockchainStateServerSentEventsHTTPHandler.Execute(w, r)

	case n == 4 && p[0] == "api" && p[1] == "v1" && p[2] == "blockdata" && r.Method == http.MethodGet:
		port.getBlockDataHTTPHandler.ExecuteByHash(w, r, p[3])
	case n == 4 && p[0] == "api" && p[1] == "v1" && p[2] == "blockdata-via-header-number" && r.Method == http.MethodGet: // NEW API ENDPOINT
		port.getBlockDataHTTPHandler.ExecuteByHeaderNumber(w, r, p[3])

	case n == 3 && p[0] == "api" && p[1] == "v1" && p[2] == "block-transactions" && r.Method == http.MethodGet:
		port.listBlockTransactionsByAddressHTTPHandler.Execute(w, r)

	case n == 3 && p[0] == "api" && p[1] == "v1" && p[2] == "signed-transaction" && r.Method == http.MethodPost:
		port.signedTransactionSubmissionHTTPHandler.Execute(w, r)

	case n == 3 && p[0] == "api" && p[1] == "v1" && p[2] == "mempool-transactions" && r.Method == http.MethodPost:
		port.mempoolTransactionReceiveDTOFromNetworkServiceHTTPHandler.Execute(w, r)

	case n == 3 && p[0] == "api" && p[1] == "v1" && p[2] == "tokens" && r.Method == http.MethodGet:
		port.tokenListByOwnerHTTPHandler.Execute(w, r)

	case n == 3 && p[0] == "api" && p[1] == "v1" && p[2] == "tokens" && r.Method == http.MethodPost:
		port.tokenMintServiceHTTPHandler.Execute(w, r)

	// --- CATCH ALL: D.N.E. ---
	default:
		// Log a message to indicate that the request is not found.
		// port.logger.Debug("404 request",
		// 	slog.Any("method", r.Method),
		// 	slog.Any("url_tokens", p),
		// 	slog.Int("url_token_count", n),
		// )

		// Return a 404 response.
		http.NotFound(w, r)
	}
}
