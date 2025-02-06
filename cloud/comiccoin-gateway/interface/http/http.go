package http

import (
	"log"
	"log/slog"
	"net/http"

	"github.com/rs/cors"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/interface/http/handler"
	mid "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/interface/http/middleware"
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

	// gatewayUserRegisterHTTPHandler                *handler.GatewayUserRegisterHTTPHandler
	// gatewayLoginHTTPHandler                       *handler.GatewayLoginHTTPHandler
	// gatewayLogoutHTTPHandler                      *handler.GatewayLogoutHTTPHandler
	// gatewayRefreshTokenHTTPHandler                *handler.GatewayRefreshTokenHTTPHandler
	// gatewayProfileDetailHTTPHandler               *handler.GatewayProfileDetailHTTPHandler
	// gatewayProfileUpdateHTTPHandler               *handler.GatewayProfileUpdateHTTPHandler
	// gatewayVerifyHTTPHandler                      *handler.GatewayVerifyHTTPHandler
	// gatewayChangePasswordHTTPHandler              *handler.GatewayChangePasswordHTTPHandler
	// gatewayForgotPasswordHTTPHandler              *handler.GatewayForgotPasswordHTTPHandler
	// gatewayResetPasswordHTTPHandler               *handler.GatewayResetPasswordHTTPHandler
	// gatewayProfileWalletAddressHTTPHandler        *handler.GatewayProfileWalletAddressHTTPHandler
	// gatewayProfileApplyForVerificationHTTPHandler *handler.GatewayApplyProfileForVerificationHTTPHandler
	//
	// attachmentCreateHTTPHandler *handler.AttachmentCreateHTTPHandler
	//
	// comicSubmissionCreateHTTPHandler                       *handler.ComicSubmissionCreateHTTPHandler
	// comicSubmissionGetHTTPHandler                          *handler.ComicSubmissionGetHTTPHandler
	// comicSubmissionListByFilterHTTPHandler                 *handler.ComicSubmissionListByFilterHTTPHandler
	// comicSubmissionCountByFilterHTTPHandler                *handler.ComicSubmissionCountByFilterHTTPHandler
	// comicSubmissionCountCoinsRewardByFilterHTTPHandler     *handler.ComicSubmissionCountCoinsRewardByFilterHTTPHandler
	// comicSubmissionTotalCoinsAwardedHTTPHandler            *handler.ComicSubmissionTotalCoinsAwardedHTTPHandler
	// comicSubmissionCountTotalCreatedTodayByUserHTTPHandler *handler.ComicSubmissionCountTotalCreatedTodayByUserHTTPHandler
	// comicSubmissionJudgeOperationHTTPHandler               *handler.ComicSubmissionJudgeOperationHTTPHandler
	//
	// userCountJoinedThisWeekHTTPHandler               *handler.UserCountJoinedThisWeekHTTPHandler
	// userListByFilterHTTPHandler                      *handler.UserListByFilterHTTPHandler
	// userProfileVerificationJudgeOperationHTTPHandler *handler.UserProfileVerificationJudgeOperationHTTPHandler
	//
	// gatewayBalanceHTTPHandler *handler.FaucetBalanceHTTPHandler
}

// NewHTTPServer creates a new HTTP server instance.
func NewHTTPServer(
	cfg *config.Configuration,
	logger *slog.Logger,
	mid mid.Middleware,
	h1 *handler.GetVersionHTTPHandler,
	h2 *handler.GetHealthCheckHTTPHandler,
	// h3 *handler.GatewayUserRegisterHTTPHandler,
	// h4 *handler.GatewayLoginHTTPHandler,
	// h5 *handler.GatewayLogoutHTTPHandler,
	// h6 *handler.GatewayRefreshTokenHTTPHandler,
	// h7 *handler.GatewayProfileDetailHTTPHandler,
	// h8 *handler.GatewayProfileUpdateHTTPHandler,
	// h9 *handler.GatewayVerifyHTTPHandler,
	// h10 *handler.GatewayChangePasswordHTTPHandler,
	// h11 *handler.GatewayForgotPasswordHTTPHandler,
	// h12 *handler.GatewayResetPasswordHTTPHandler,
	// h13 *handler.GatewayProfileWalletAddressHTTPHandler,
	// h14 *handler.GatewayApplyProfileForVerificationHTTPHandler,
	// h15 *handler.AttachmentCreateHTTPHandler,
	// h16 *handler.ComicSubmissionCreateHTTPHandler,
	// h17 *handler.ComicSubmissionGetHTTPHandler,
	// h18 *handler.ComicSubmissionListByFilterHTTPHandler,
	// h19 *handler.ComicSubmissionCountByFilterHTTPHandler,
	// h20 *handler.ComicSubmissionCountCoinsRewardByFilterHTTPHandler,
	// h21 *handler.ComicSubmissionTotalCoinsAwardedHTTPHandler,
	// h22 *handler.ComicSubmissionCountTotalCreatedTodayByUserHTTPHandler,
	// h23 *handler.ComicSubmissionJudgeOperationHTTPHandler,
	// h24 *handler.UserCountJoinedThisWeekHTTPHandler,
	// h25 *handler.UserListByFilterHTTPHandler,
	// h26 *handler.FaucetBalanceHTTPHandler,
	// h27 *handler.UserProfileVerificationJudgeOperationHTTPHandler,
) HTTPServer {
	// Check if the HTTP address is set in the configuration.
	if cfg.App.HTTPAddress == "" {
		log.Fatal("missing http address")
	}

	// Initialize the ServeMux.
	mux := http.NewServeMux()

	// Set up CORS middleware to allow all origins.
	handler := cors.AllowAll().Handler(mux)

	// Bind the HTTP server to the assigned address and port.
	srv := &http.Server{
		Addr:    cfg.App.HTTPAddress,
		Handler: handler,
	}

	// Create a new HTTP server instance.
	port := &httpServerImpl{
		cfg:                       cfg,
		logger:                    logger,
		middleware:                mid,
		server:                    srv,
		getVersionHTTPHandler:     h1,
		getHealthCheckHTTPHandler: h2,
		// gatewayUserRegisterHTTPHandler:                         h3,
		// gatewayLoginHTTPHandler:                                h4,
		// gatewayLogoutHTTPHandler:                               h5,
		// gatewayRefreshTokenHTTPHandler:                         h6,
		// gatewayProfileDetailHTTPHandler:                        h7,
		// gatewayProfileUpdateHTTPHandler:                        h8,
		// gatewayVerifyHTTPHandler:                               h9,
		// gatewayChangePasswordHTTPHandler:                       h10,
		// gatewayForgotPasswordHTTPHandler:                       h11,
		// gatewayResetPasswordHTTPHandler:                        h12,
		// gatewayProfileWalletAddressHTTPHandler:                 h13,
		// gatewayProfileApplyForVerificationHTTPHandler:          h14,
		// attachmentCreateHTTPHandler:                            h15,
		// comicSubmissionCreateHTTPHandler:                       h16,
		// comicSubmissionGetHTTPHandler:                          h17,
		// comicSubmissionListByFilterHTTPHandler:                 h18,
		// comicSubmissionCountByFilterHTTPHandler:                h19,
		// comicSubmissionCountCoinsRewardByFilterHTTPHandler:     h20,
		// comicSubmissionTotalCoinsAwardedHTTPHandler:            h21,
		// comicSubmissionCountTotalCreatedTodayByUserHTTPHandler: h22,
		// comicSubmissionJudgeOperationHTTPHandler:               h23,
		// userCountJoinedThisWeekHTTPHandler:                     h24,
		// userListByFilterHTTPHandler:                            h25,
		// gatewayBalanceHTTPHandler:                               h26,
		// userProfileVerificationJudgeOperationHTTPHandler:       h27,
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
	// case n == 4 && p[0] == "api" && p[1] == "v1" && p[2] == "register" && p[3] == "user" && r.Method == http.MethodPost:
	// 	port.gatewayUserRegisterHTTPHandler.Execute(w, r)
	// case n == 3 && p[0] == "api" && p[1] == "v1" && p[2] == "login" && r.Method == http.MethodPost:
	// 	port.gatewayLoginHTTPHandler.Execute(w, r)
	// case n == 3 && p[0] == "api" && p[1] == "v1" && p[2] == "logout" && r.Method == http.MethodPost:
	// 	port.gatewayLogoutHTTPHandler.Execute(w, r)
	// case n == 3 && p[0] == "api" && p[1] == "v1" && p[2] == "refresh-token" && r.Method == http.MethodPost:
	// 	port.gatewayRefreshTokenHTTPHandler.Execute(w, r)
	// case n == 3 && p[0] == "api" && p[1] == "v1" && p[2] == "profile" && r.Method == http.MethodGet:
	// 	port.gatewayProfileDetailHTTPHandler.Execute(w, r)
	// case n == 3 && p[0] == "api" && p[1] == "v1" && p[2] == "profile" && r.Method == http.MethodPut:
	// 	port.gatewayProfileUpdateHTTPHandler.Execute(w, r)
	// case n == 3 && p[0] == "api" && p[1] == "v1" && p[2] == "verify" && r.Method == http.MethodPost:
	// 	port.gatewayVerifyHTTPHandler.Execute(w, r)
	// case n == 4 && p[0] == "api" && p[1] == "v1" && p[2] == "profile" && p[3] == "change-password" && r.Method == http.MethodPut:
	// 	port.gatewayChangePasswordHTTPHandler.Execute(w, r)
	// case n == 4 && p[0] == "api" && p[1] == "v1" && p[2] == "profile" && p[3] == "wallet-password" && r.Method == http.MethodPut:
	// 	port.gatewayProfileWalletAddressHTTPHandler.Execute(w, r)
	// case n == 4 && p[0] == "api" && p[1] == "v1" && p[2] == "profile" && p[3] == "apply-for-verification" && r.Method == http.MethodPut:
	// 	port.gatewayProfileApplyForVerificationHTTPHandler.Execute(w, r)
	// case n == 3 && p[0] == "api" && p[1] == "v1" && p[2] == "forgot-password" && r.Method == http.MethodPost:
	// 	port.gatewayForgotPasswordHTTPHandler.Execute(w, r)
	// case n == 3 && p[0] == "api" && p[1] == "v1" && p[2] == "password-reset" && r.Method == http.MethodPost:
	// 	port.gatewayResetPasswordHTTPHandler.Execute(w, r)
	// case n == 3 && p[0] == "api" && p[1] == "v1" && p[2] == "attachments" && r.Method == http.MethodPost:
	// 	port.attachmentCreateHTTPHandler.Execute(w, r)
	// case n == 3 && p[0] == "api" && p[1] == "v1" && p[2] == "comic-submissions" && r.Method == http.MethodPost:
	// 	port.comicSubmissionCreateHTTPHandler.Execute(w, r)
	// case n == 3 && p[0] == "api" && p[1] == "v1" && p[2] == "comic-submissions" && r.Method == http.MethodGet:
	// 	port.comicSubmissionListByFilterHTTPHandler.Execute(w, r)
	// case n == 4 && p[0] == "api" && p[1] == "v1" && p[2] == "comic-submission" && r.Method == http.MethodGet:
	// 	port.comicSubmissionGetHTTPHandler.Execute(w, r, p[3])
	// case n == 4 && p[0] == "api" && p[1] == "v1" && p[2] == "comic-submissions" && p[3] == "count" && r.Method == http.MethodGet:
	// 	port.comicSubmissionCountByFilterHTTPHandler.Execute(w, r)
	// case n == 4 && p[0] == "api" && p[1] == "v1" && p[2] == "comic-submissions" && p[3] == "count-coins-reward" && r.Method == http.MethodGet:
	// 	port.comicSubmissionCountCoinsRewardByFilterHTTPHandler.Execute(w, r)
	// case n == 4 && p[0] == "api" && p[1] == "v1" && p[2] == "comic-submissions" && p[3] == "count-total-created-today-by-user" && r.Method == http.MethodGet:
	// 	port.comicSubmissionCountTotalCreatedTodayByUserHTTPHandler.Execute(w, r)
	// case n == 4 && p[0] == "api" && p[1] == "v1" && p[2] == "comic-submissions" && p[3] == "judge-operation" && r.Method == http.MethodPost:
	// 	port.comicSubmissionJudgeOperationHTTPHandler.Execute(w, r)
	// case n == 4 && p[0] == "api" && p[1] == "v1" && p[2] == "comic-submissions" && p[3] == "total-coins-awarded" && r.Method == http.MethodGet:
	// 	port.comicSubmissionTotalCoinsAwardedHTTPHandler.Execute(w, r)
	// case n == 3 && p[0] == "api" && p[1] == "v1" && p[2] == "users" && r.Method == http.MethodGet:
	// 	port.userListByFilterHTTPHandler.Execute(w, r)
	// case n == 4 && p[0] == "api" && p[1] == "v1" && p[2] == "users" && p[3] == "count-joined-this-week" && r.Method == http.MethodGet:
	// 	port.userCountJoinedThisWeekHTTPHandler.Execute(w, r)
	// case n == 5 && p[0] == "api" && p[1] == "v1" && p[2] == "users" && p[3] == "operations" && p[4] == "profile-verification-judge" && r.Method == http.MethodPost:
	// 	port.userProfileVerificationJudgeOperationHTTPHandler.Execute(w, r)
	// case n == 4 && p[0] == "api" && p[1] == "v1" && p[2] == "gateway" && p[3] == "balance" && r.Method == http.MethodGet:
	// 	port.gatewayBalanceHTTPHandler.Execute(w, r)

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
