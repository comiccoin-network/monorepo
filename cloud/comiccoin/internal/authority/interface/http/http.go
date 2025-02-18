// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/interface/http/http.go
package http

import (
	"log"
	"log/slog"
	"net/http"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/interface/http/handler"
	mid "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/interface/http/middleware"
)

// HTTPServer represents an HTTP server that handles incoming requests.
type HTTPServer interface {
	// HandleIncomingHTTPRequest method handles incoming HTTP requests.
	HandleIncomingHTTPRequest(w http.ResponseWriter, r *http.Request)
	HandleIncomingDeprecatedPathHTTPRequest(w http.ResponseWriter, r *http.Request)

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

	getVersionHTTPHandler                                         *handler.GetVersionHTTPHandler
	getHealthCheckHTTPHandler                                     *handler.GetHealthCheckHTTPHandler
	getGenesisBlockDataHTTPHandler                                *handler.GetGenesisBlockDataHTTPHandler
	getBlockchainStateHTTPHandler                                 *handler.GetBlockchainStateHTTPHandler
	getBlockDataHTTPHandler                                       *handler.GetBlockDataHTTPHandler
	listBlockTransactionsByAddressHTTPHandler                     *handler.ListBlockTransactionsByAddressHTTPHandler
	getBlockTransactionByNonceHTTPHandler                         *handler.GetBlockTransactionByNonceHTTPHandler
	listOwnedTokenBlockTransactionsByAddressHTTPHandler           *handler.ListOwnedTokenBlockTransactionsByAddressHTTPHandler
	prepareTransactionHTTPHandler                                 *handler.PrepareTransactionHTTPHandler
	signedTransactionSubmissionHTTPHandler                        *handler.SignedTransactionSubmissionHTTPHandler
	mempoolTransactionReceiveDTOFromNetworkServiceHTTPHandler     *handler.MempoolTransactionReceiveDTOFromNetworkServiceHTTPHandler
	blockchainStateChangeEventDTOHTTPHandler                      *handler.BlockchainStateChangeEventDTOHTTPHandler
	blockchainStateServerSentEventsHTTPHandler                    *handler.BlockchainStateServerSentEventsHTTPHandler
	getLatestBlockTransactionByAddressServerSentEventsHTTPHandler *handler.GetLatestBlockTransactionByAddressServerSentEventsHTTPHandler
	tokenListByOwnerHTTPHandler                                   *handler.TokenListByOwnerHTTPHandler
	tokenMintServiceHTTPHandler                                   *handler.TokenMintServiceHTTPHandler
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
	http6 *handler.GetBlockTransactionByNonceHTTPHandler,
	http7 *handler.ListOwnedTokenBlockTransactionsByAddressHTTPHandler,
	http8 *handler.BlockchainStateChangeEventDTOHTTPHandler,
	http9 *handler.BlockchainStateServerSentEventsHTTPHandler,
	http10 *handler.GetLatestBlockTransactionByAddressServerSentEventsHTTPHandler,
	http11 *handler.GetBlockDataHTTPHandler,
	http12 *handler.PrepareTransactionHTTPHandler,
	http13 *handler.SignedTransactionSubmissionHTTPHandler,
	http14 *handler.MempoolTransactionReceiveDTOFromNetworkServiceHTTPHandler,
	http15 *handler.TokenListByOwnerHTTPHandler,
	http16 *handler.TokenMintServiceHTTPHandler,
) HTTPServer {
	// Check if the HTTP address is set in the configuration.
	if cfg.App.IP == "" {
		log.Fatal("http server missing ip address")
	}
	if cfg.App.Port == "" {
		log.Fatal("http server missing port number")
	}

	// Create a new HTTP server instance.
	port := &httpServerImpl{
		cfg:                            cfg,
		logger:                         logger,
		middleware:                     mid,
		getVersionHTTPHandler:          http1,
		getHealthCheckHTTPHandler:      http2,
		getGenesisBlockDataHTTPHandler: http3,
		getBlockchainStateHTTPHandler:  http4,
		listBlockTransactionsByAddressHTTPHandler:                     http5,
		getBlockTransactionByNonceHTTPHandler:                         http6,
		listOwnedTokenBlockTransactionsByAddressHTTPHandler:           http7,
		blockchainStateChangeEventDTOHTTPHandler:                      http8,
		blockchainStateServerSentEventsHTTPHandler:                    http9,
		getLatestBlockTransactionByAddressServerSentEventsHTTPHandler: http10,
		getBlockDataHTTPHandler:                                       http11,
		prepareTransactionHTTPHandler:                                 http12,
		signedTransactionSubmissionHTTPHandler:                        http13,
		mempoolTransactionReceiveDTOFromNetworkServiceHTTPHandler:     http14,
		tokenListByOwnerHTTPHandler:                                   http15,
		tokenMintServiceHTTPHandler:                                   http16,
	}

	return port
}

// Shutdown shuts down the HTTP server.
func (port *httpServerImpl) Shutdown() {
	// Log a message to indicate that the HTTP server is shutting down.
	port.logger.Info("Gracefully shutting down HTTP JSON API")

	port.middleware.Shutdown()
}

func (port *httpServerImpl) HandleIncomingHTTPRequest(w http.ResponseWriter, r *http.Request) {
	// Apply authority middleware
	handler := port.middleware.Attach(func(w http.ResponseWriter, r *http.Request) {
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
		case n == 4 && p[0] == "api" && p[1] == "v1" && p[2] == "authority" && p[3] == "genesis" && r.Method == http.MethodGet:
			port.getGenesisBlockDataHTTPHandler.Execute(w, r)

		case n == 4 && p[0] == "api" && p[1] == "v1" && p[2] == "authority" && p[3] == "blockchain-state" && r.Method == http.MethodGet:
			port.getBlockchainStateHTTPHandler.Execute(w, r)

		case n == 5 && p[0] == "api" && p[1] == "v1" && p[2] == "authority" && p[3] == "blockchain-state" && p[4] == "changes" && r.Method == http.MethodGet: // DEPRECATED
			port.blockchainStateChangeEventDTOHTTPHandler.Execute(w, r)

			// DEVELOPERS NOTE: Using `POST` method to get it working on DigitalOcean App Platform, see more for details:
			// "Does App Platform support SSE (Server-Sent Events) application?" via https://www.digitalocean.com/community/questions/does-app-platform-support-sse-server-sent-events-application
		case n == 5 && p[0] == "api" && p[1] == "v1" && p[2] == "authority" && p[3] == "blockchain-state" && p[4] == "sse" && r.Method == http.MethodPost:
			port.blockchainStateServerSentEventsHTTPHandler.Execute(w, r)
		case n == 5 && p[0] == "api" && p[1] == "v1" && p[2] == "authority" && p[3] == "latest-block-transaction" && p[4] == "sse" && r.Method == http.MethodPost:
			port.getLatestBlockTransactionByAddressServerSentEventsHTTPHandler.Execute(w, r)

		case n == 5 && p[0] == "api" && p[1] == "v1" && p[2] == "authority" && p[3] == "blockdata" && r.Method == http.MethodGet:
			port.getBlockDataHTTPHandler.ExecuteByHash(w, r, p[4])

		case n == 5 && p[0] == "api" && p[1] == "v1" && p[2] == "authority" && p[3] == "blockdata-via-hash" && r.Method == http.MethodGet:
			port.getBlockDataHTTPHandler.ExecuteByHash(w, r, p[4]) // Note: Same as above.

		case n == 5 && p[0] == "api" && p[1] == "v1" && p[2] == "authority" && p[3] == "blockdata-via-header-number" && r.Method == http.MethodGet:
			port.getBlockDataHTTPHandler.ExecuteByHeaderNumber(w, r, p[4])

		case n == 5 && p[0] == "api" && p[1] == "v1" && p[2] == "authority" && p[3] == "blockdata-via-tx-nonce" && r.Method == http.MethodGet:
			port.getBlockDataHTTPHandler.ExecuteByTransactionNonce(w, r, p[4])

		case n == 4 && p[0] == "api" && p[1] == "v1" && p[2] == "authority" && p[3] == "block-transactions" && r.Method == http.MethodGet:
			port.listBlockTransactionsByAddressHTTPHandler.Execute(w, r)

		case n == 5 && p[0] == "api" && p[1] == "v1" && p[2] == "authority" && p[3] == "block-transaction-by-nonce" && r.Method == http.MethodGet:
			port.getBlockTransactionByNonceHTTPHandler.ExecuteByNonce(w, r, p[4])

		case n == 5 && p[0] == "api" && p[1] == "v1" && p[2] == "authority" && p[3] == "block-transactions" && p[4] == "owned-tokens" && r.Method == http.MethodGet:
			port.listOwnedTokenBlockTransactionsByAddressHTTPHandler.Execute(w, r)

		case n == 4 && p[0] == "api" && p[1] == "v1" && p[2] == "authority" && p[3] == "signed-transaction" && r.Method == http.MethodPost:
			port.signedTransactionSubmissionHTTPHandler.Execute(w, r)

		case n == 5 && p[0] == "api" && p[1] == "v1" && p[2] == "authority" && p[3] == "transaction" && p[4] == "prepare" && r.Method == http.MethodPost:
			port.prepareTransactionHTTPHandler.Execute(w, r)

		case n == 4 && p[0] == "api" && p[1] == "v1" && p[2] == "authority" && p[3] == "mempool-transactions" && r.Method == http.MethodPost:
			port.mempoolTransactionReceiveDTOFromNetworkServiceHTTPHandler.Execute(w, r)

		case n == 4 && p[0] == "api" && p[1] == "v1" && p[2] == "authority" && p[3] == "tokens" && r.Method == http.MethodGet:
			port.tokenListByOwnerHTTPHandler.Execute(w, r)

		case n == 4 && p[0] == "api" && p[1] == "v1" && p[2] == "authority" && p[3] == "tokens" && r.Method == http.MethodPost:
			port.tokenMintServiceHTTPHandler.Execute(w, r)

		// --- CATCH ALL: D.N.E. ---
		default:
			// DEVELOPERS NOTE: We will not be returning 404 b/c that is handled in the unifiedhttp handler.
		}
	})
	handler(w, r)
}

func (port *httpServerImpl) HandleIncomingDeprecatedPathHTTPRequest(w http.ResponseWriter, r *http.Request) {
	// Apply authority middleware
	handler := port.middleware.Attach(func(w http.ResponseWriter, r *http.Request) {
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
		case n == 3 && p[0] == "api" && p[1] == "v1" && p[2] == "genesis" && r.Method == http.MethodGet:
			port.getGenesisBlockDataHTTPHandler.Execute(w, r)

		case n == 3 && p[0] == "api" && p[1] == "v1" && p[2] == "blockchain-state" && r.Method == http.MethodGet:
			port.getBlockchainStateHTTPHandler.Execute(w, r)

		case n == 4 && p[0] == "api" && p[1] == "v1" && p[2] == "blockchain-state" && p[3] == "changes" && r.Method == http.MethodGet: // DEPRECATED
			port.blockchainStateChangeEventDTOHTTPHandler.Execute(w, r)

		// DEVELOPERS NOTE: Using `POST` method to get it working on DigitalOcean App Platform, see more for details:
		// "Does App Platform support SSE (Server-Sent Events) application?" via https://www.digitalocean.com/community/questions/does-app-platform-support-sse-server-sent-events-application
		case n == 4 && p[0] == "api" && p[1] == "v1" && p[2] == "blockchain-state" && p[3] == "sse" && r.Method == http.MethodPost:
			port.blockchainStateServerSentEventsHTTPHandler.Execute(w, r)
		case n == 4 && p[0] == "api" && p[1] == "v1" && p[2] == "latest-block-transaction" && p[3] == "sse" && r.Method == http.MethodPost:
			port.getLatestBlockTransactionByAddressServerSentEventsHTTPHandler.Execute(w, r)

		case n == 4 && p[0] == "api" && p[1] == "v1" && p[2] == "blockdata" && r.Method == http.MethodGet:
			port.getBlockDataHTTPHandler.ExecuteByHash(w, r, p[3])

		case n == 4 && p[0] == "api" && p[1] == "v1" && p[2] == "blockdata-via-hash" && r.Method == http.MethodGet:
			port.getBlockDataHTTPHandler.ExecuteByHash(w, r, p[3]) // Note: Same as above.

		case n == 4 && p[0] == "api" && p[1] == "v1" && p[2] == "blockdata-via-header-number" && r.Method == http.MethodGet:
			port.getBlockDataHTTPHandler.ExecuteByHeaderNumber(w, r, p[3])

		case n == 4 && p[0] == "api" && p[1] == "v1" && p[2] == "blockdata-via-tx-nonce" && r.Method == http.MethodGet:
			port.getBlockDataHTTPHandler.ExecuteByTransactionNonce(w, r, p[3])

		case n == 3 && p[0] == "api" && p[1] == "v1" && p[2] == "block-transactions" && r.Method == http.MethodGet:
			port.listBlockTransactionsByAddressHTTPHandler.Execute(w, r)

		case n == 4 && p[0] == "api" && p[1] == "v1" && p[2] == "block-transaction-by-nonce" && r.Method == http.MethodGet:
			port.getBlockTransactionByNonceHTTPHandler.ExecuteByNonce(w, r, p[3])

		case n == 4 && p[0] == "api" && p[1] == "v1" && p[2] == "block-transactions" && p[3] == "owned-tokens" && r.Method == http.MethodGet:
			port.listOwnedTokenBlockTransactionsByAddressHTTPHandler.Execute(w, r)

		case n == 3 && p[0] == "api" && p[1] == "v1" && p[2] == "signed-transaction" && r.Method == http.MethodPost:
			port.signedTransactionSubmissionHTTPHandler.Execute(w, r)

		case n == 4 && p[0] == "api" && p[1] == "v1" && p[2] == "transaction" && p[3] == "prepare" && r.Method == http.MethodPost:
			port.prepareTransactionHTTPHandler.Execute(w, r)

		case n == 3 && p[0] == "api" && p[1] == "v1" && p[2] == "mempool-transactions" && r.Method == http.MethodPost:
			port.mempoolTransactionReceiveDTOFromNetworkServiceHTTPHandler.Execute(w, r)

		case n == 3 && p[0] == "api" && p[1] == "v1" && p[2] == "tokens" && r.Method == http.MethodGet:
			port.tokenListByOwnerHTTPHandler.Execute(w, r)

		case n == 3 && p[0] == "api" && p[1] == "v1" && p[2] == "tokens" && r.Method == http.MethodPost:
			port.tokenMintServiceHTTPHandler.Execute(w, r)

		// --- CATCH ALL: D.N.E. ---
		default:
			// // Log a message to indicate that the request is not found.
			// port.logger.Debug("404 request",
			// 	slog.Any("method", r.Method),
			// 	slog.Any("url_tokens", p),
			// 	slog.Int("url_token_count", n),
			// )

			// Return a 404 response.
			http.NotFound(w, r)
		}
	})
	handler(w, r)
}
