// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/interface/http/http.go
package http

import (
	"context"
	"log/slog"
	"net/http"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"

	// http_introspection "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/interface/http/introspection"
	// http_login "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/interface/http/login"
	mid "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/interface/http/middleware"
	http_system "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/interface/http/system"

	// http_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/interface/http/oauth"
	// http_registration "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/interface/http/registration"
	// http_token "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/interface/http/token"
	http_dashboard "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/interface/http/dashboard"
	http_gateway "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/interface/http/gateway"
	http_hello "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/interface/http/hello"
	http_me "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/interface/http/me"
	http_publicwallet "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/interface/http/publicwallet"
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

	// Core handlers
	getVersionHTTPHandler     *http_system.GetVersionHTTPHandler
	getHealthCheckHTTPHandler *http_system.GetHealthCheckHTTPHandler

	// Protect API Endpoints
	gatewayUserRegisterHTTPHandler   *http_gateway.GatewayUserRegisterHTTPHandler
	gatewayVerifyEmailHTTPHandler    *http_gateway.GatewayVerifyEmailHTTPHandler
	gatewayLoginHTTPHandler          *http_gateway.GatewayLoginHTTPHandler
	gatewayLogoutHTTPHandler         *http_gateway.GatewayLogoutHTTPHandler
	gatewayRefreshTokenHTTPHandler   *http_gateway.GatewayRefreshTokenHTTPHandler
	gatewayForgotPasswordHTTPHandler *http_gateway.GatewayForgotPasswordHTTPHandler
	gatewayResetPasswordHTTPHandler  *http_gateway.GatewayResetPasswordHTTPHandler

	getHelloHTTPHandler *http_hello.GetHelloHTTPHandler

	getMeHTTPHandler               *http_me.GetMeHTTPHandler
	postMeConnectWalletHTTPHandler *http_me.PostMeConnectWalletHTTPHandler
	putUpdateMeHTTPHandler         *http_me.PutUpdateMeHTTPHandler
	deleteMeHTTPHandler            *http_me.DeleteMeHTTPHandler
	postVerifyProfileHTTPHandler   *http_me.PostVerifyProfileHTTPHandler

	createPublicWalletHTTPHandler           *http_publicwallet.CreatePublicWalletHTTPHandler
	getPublicWalletByIDHTTPHandler          *http_publicwallet.GetPublicWalletByIDHTTPHandler
	getPublicWalletByAddressHTTPHandler     *http_publicwallet.GetPublicWalletByAddressHTTPHandler
	updatePublicWalletByIDHTTPHandler       *http_publicwallet.UpdatePublicWalletByIDHTTPHandler
	updatePublicWalletByAddressHTTPHandler  *http_publicwallet.UpdatePublicWalletByAddressHTTPHandler
	deletePublicWalletByIDHTTPHandler       *http_publicwallet.DeletePublicWalletByIDHTTPHandler
	listPublicWalletsByFilterHTTPHandler    *http_publicwallet.ListPublicWalletsByFilterHTTPHandler
	countPublicWalletsByFilterHTTPHandler   *http_publicwallet.CountPublicWalletsByFilterHTTPHandler
	listAllPublicWalletAddressesHTTPHandler *http_publicwallet.ListAllPublicWalletAddressesHTTPHandler

	dashboard *http_dashboard.DashboardHTTPHandler
}

// NewHTTPServer creates a new HTTP server instance.
func NewHTTPServer(
	cfg *config.Configuration,
	logger *slog.Logger,
	mid mid.Middleware,
	gatewayUserRegisterHTTPHandler *http_gateway.GatewayUserRegisterHTTPHandler,
	gatewayVerifyEmailHTTPHandler *http_gateway.GatewayVerifyEmailHTTPHandler,
	gatewayLoginHTTPHandler *http_gateway.GatewayLoginHTTPHandler,
	gatewayLogoutHTTPHandler *http_gateway.GatewayLogoutHTTPHandler,
	gatewayRefreshTokenHTTPHandler *http_gateway.GatewayRefreshTokenHTTPHandler,
	gatewayForgotPasswordHTTPHandler *http_gateway.GatewayForgotPasswordHTTPHandler,
	gatewayResetPasswordHTTPHandler *http_gateway.GatewayResetPasswordHTTPHandler,
	getHelloHTTPHandler *http_hello.GetHelloHTTPHandler,
	getMeHTTPHandler *http_me.GetMeHTTPHandler,
	postMeConnectWalletHTTPHandler *http_me.PostMeConnectWalletHTTPHandler,
	putUpdateMeHTTPHandler *http_me.PutUpdateMeHTTPHandler,
	deleteMeHTTPHandler *http_me.DeleteMeHTTPHandler,
	postVerifyProfileHTTPHandler *http_me.PostVerifyProfileHTTPHandler,
	createPublicWalletHTTPHandler *http_publicwallet.CreatePublicWalletHTTPHandler,
	getPublicWalletByIDHTTPHandler *http_publicwallet.GetPublicWalletByIDHTTPHandler,
	getPublicWalletByAddressHTTPHandler *http_publicwallet.GetPublicWalletByAddressHTTPHandler,
	updatePublicWalletByIDHTTPHandler *http_publicwallet.UpdatePublicWalletByIDHTTPHandler,
	updatePublicWalletByAddressHTTPHandler *http_publicwallet.UpdatePublicWalletByAddressHTTPHandler,
	deletePublicWalletByIDHTTPHandler *http_publicwallet.DeletePublicWalletByIDHTTPHandler,
	listPublicWalletsByFilterHTTPHandler *http_publicwallet.ListPublicWalletsByFilterHTTPHandler,
	countPublicWalletsByFilterHTTPHandler *http_publicwallet.CountPublicWalletsByFilterHTTPHandler,
	listAllPublicWalletAddressesHTTPHandler *http_publicwallet.ListAllPublicWalletAddressesHTTPHandler,
	dashboard *http_dashboard.DashboardHTTPHandler,
) HTTPServer {

	// Create a new HTTP server instance.
	port := &httpServerImpl{
		cfg:                              cfg,
		logger:                           logger,
		middleware:                       mid,
		gatewayUserRegisterHTTPHandler:   gatewayUserRegisterHTTPHandler,
		gatewayVerifyEmailHTTPHandler:    gatewayVerifyEmailHTTPHandler,
		gatewayLoginHTTPHandler:          gatewayLoginHTTPHandler,
		gatewayLogoutHTTPHandler:         gatewayLogoutHTTPHandler,
		gatewayRefreshTokenHTTPHandler:   gatewayRefreshTokenHTTPHandler,
		gatewayForgotPasswordHTTPHandler: gatewayForgotPasswordHTTPHandler,
		gatewayResetPasswordHTTPHandler:  gatewayResetPasswordHTTPHandler,
		getHelloHTTPHandler:              getHelloHTTPHandler,
		getMeHTTPHandler:                 getMeHTTPHandler,
		deleteMeHTTPHandler:              deleteMeHTTPHandler,
		postMeConnectWalletHTTPHandler:   postMeConnectWalletHTTPHandler,
		putUpdateMeHTTPHandler:           putUpdateMeHTTPHandler,
		postVerifyProfileHTTPHandler:     postVerifyProfileHTTPHandler,
		dashboard:                        dashboard,
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
		// --- Unprotected API endpoints ---
		case n == 4 && p[0] == "iam" && p[1] == "api" && p[2] == "v1" && p[3] == "register" && r.Method == http.MethodPost:
			port.gatewayUserRegisterHTTPHandler.Execute(w, r)
		case n == 4 && p[0] == "iam" && p[1] == "api" && p[2] == "v1" && p[3] == "verify-email-code" && r.Method == http.MethodPost:
			port.gatewayVerifyEmailHTTPHandler.Execute(w, r)
		case n == 4 && p[0] == "iam" && p[1] == "api" && p[2] == "v1" && p[3] == "verify" && r.Method == http.MethodPost: // DEPRECATED: Use verify-email-code instead
			port.gatewayVerifyEmailHTTPHandler.Execute(w, r)
		case n == 4 && p[0] == "iam" && p[1] == "api" && p[2] == "v1" && p[3] == "login" && r.Method == http.MethodPost:
			port.gatewayLoginHTTPHandler.Execute(w, r)
		case n == 4 && p[0] == "iam" && p[1] == "api" && p[2] == "v1" && p[3] == "logout" && r.Method == http.MethodPost:
			port.gatewayLogoutHTTPHandler.Execute(w, r)
		case n == 5 && p[0] == "iam" && p[1] == "api" && p[2] == "v1" && p[3] == "token" && p[4] == "refresh" && r.Method == http.MethodPost:
			port.gatewayRefreshTokenHTTPHandler.Execute(w, r)
		case n == 4 && p[0] == "iam" && p[1] == "api" && p[2] == "v1" && p[3] == "forgot-password" && r.Method == http.MethodPost:
			port.gatewayForgotPasswordHTTPHandler.Execute(w, r)
		case n == 4 && p[0] == "iam" && p[1] == "api" && p[2] == "v1" && p[3] == "reset-password" && r.Method == http.MethodPost:
			port.gatewayResetPasswordHTTPHandler.Execute(w, r)

		// --- Resource endpoints ---
		// Hello
		case n == 4 && p[0] == "iam" && p[1] == "api" && p[2] == "v1" && p[3] == "say-hello" && r.Method == http.MethodPost:
			port.getHelloHTTPHandler.Execute(w, r)

		// Me
		case n == 4 && p[0] == "iam" && p[1] == "api" && p[2] == "v1" && p[3] == "me" && r.Method == http.MethodGet:
			port.getMeHTTPHandler.Execute(w, r)
		case n == 5 && p[0] == "iam" && p[1] == "api" && p[2] == "v1" && p[3] == "me" && p[4] == "connect-wallet" && r.Method == http.MethodPost:
			port.postMeConnectWalletHTTPHandler.Execute(w, r)
		case n == 4 && p[0] == "iam" && p[1] == "api" && p[2] == "v1" && p[3] == "me" && r.Method == http.MethodPut:
			port.putUpdateMeHTTPHandler.Execute(w, r)
		case n == 5 && p[0] == "iam" && p[1] == "api" && p[2] == "v1" && p[3] == "me" && p[4] == "delete" && r.Method == http.MethodPost:
			port.deleteMeHTTPHandler.Execute(w, r)
		case n == 5 && p[0] == "iam" && p[1] == "api" && p[2] == "v1" && p[3] == "me" && p[4] == "verify-profile" && r.Method == http.MethodPost:
			port.postVerifyProfileHTTPHandler.Execute(w, r)

		// Dashboard
		case n == 4 && p[0] == "iam" && p[1] == "api" && p[2] == "v1" && p[3] == "dashboard" && r.Method == http.MethodGet:
			port.dashboard.Execute(w, r)

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
