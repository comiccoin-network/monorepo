// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/interface/http/http.go
package http

import (
	"log"
	"log/slog"
	"net/http"
	"sync"
	"time"

	"github.com/rs/cors"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/security/oauth"
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

	authorizeHandler *handler.AuthorizeHandler

	loginHandler *handler.LoginHandler

	tokenHandler         *handler.TokenHandler
	introspectionHandler *handler.IntrospectionHandler
	refreshTokenHandler  *handler.RefreshTokenHandler

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
	// userCountJoinedThisWeekHTTPHandler               *handler.UserCountJoinedThisWeekHTTPHandler
	// userListByFilterHTTPHandler                      *handler.UserListByFilterHTTPHandler
	// userProfileVerificationJudgeOperationHTTPHandler *handler.UserProfileVerificationJudgeOperationHTTPHandler
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
	// h24 *handler.UserCountJoinedThisWeekHTTPHandler,
	// h25 *handler.UserListByFilterHTTPHandler,
	// h27 *handler.UserProfileVerificationJudgeOperationHTTPHandler,
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

	// Initialize your implementations of the interfaces
	clientService := NewClientService()
	authStore := NewAuthStore()
	userService := NewUserService()
	tokenStore := NewTokenStore() // Add this line

	// Create the handlers with the correct dependencies
	authorizeHandler := handler.NewAuthorizeHandler(
		logger,
		clientService,
		authStore,
	)

	loginHandler := handler.NewLoginHandler(
		logger,
		authStore,
		userService,
	)

	tokenHandler := handler.NewTokenHandler(
		logger,
		clientService,
		authStore,
	)

	refreshTokenHandler := handler.NewRefreshTokenHandler(
		logger,
		clientService,
		tokenStore,
		authStore,
	)

	introspectionHandler := handler.NewIntrospectionHandler(
		logger,
		clientService,
		tokenStore,
	)

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
		// userCountJoinedThisWeekHTTPHandler:                     h24,
		// userListByFilterHTTPHandler:                            h25,
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

// ClientServiceImpl implements the oauth.ClientService interface
type ClientServiceImpl struct {
	clients map[string]oauth.Client
	mu      sync.RWMutex
}

func NewClientService() *ClientServiceImpl {
	return &ClientServiceImpl{
		clients: map[string]oauth.Client{
			"test_client": {
				ID:          "test_client",
				Secret:      "test_secret",
				RedirectURI: "http://localhost:8081/callback",
			},
		},
	}
}

func (s *ClientServiceImpl) ValidateClient(clientID, redirectURI string) (bool, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	client, exists := s.clients[clientID]
	if !exists {
		return false, nil
	}
	return client.RedirectURI == redirectURI, nil
}

func (s *ClientServiceImpl) ValidateClientCredentials(clientID, clientSecret string) (bool, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	client, exists := s.clients[clientID]
	if !exists {
		return false, nil
	}
	return client.Secret == clientSecret, nil
}

// Add the missing GetClient method
func (s *ClientServiceImpl) GetClient(clientID string) (*oauth.Client, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	client, exists := s.clients[clientID]
	if !exists {
		return nil, oauth.ErrInvalidClient
	}
	return &client, nil
}

// AuthStoreImpl implements the oauth.AuthorizationStore interface
type AuthStoreImpl struct {
	mu          sync.RWMutex
	pendingAuth map[string]oauth.PendingAuthorization
	authCodes   map[string]oauth.AuthorizationCode
}

func NewAuthStore() *AuthStoreImpl {
	return &AuthStoreImpl{
		pendingAuth: make(map[string]oauth.PendingAuthorization),
		authCodes:   make(map[string]oauth.AuthorizationCode),
	}
}

func (s *AuthStoreImpl) StorePendingAuth(authID string, auth oauth.PendingAuthorization) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.pendingAuth[authID] = auth

	// Start a goroutine to clean up expired authorizations
	go func() {
		time.Sleep(time.Until(auth.ExpiresAt))
		s.mu.Lock()
		delete(s.pendingAuth, authID)
		s.mu.Unlock()
	}()

	return nil
}

func (s *AuthStoreImpl) GetPendingAuth(authID string) (oauth.PendingAuthorization, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	auth, exists := s.pendingAuth[authID]
	if !exists {
		return oauth.PendingAuthorization{}, oauth.ErrAuthorizationNotFound
	}

	if time.Now().After(auth.ExpiresAt) {
		delete(s.pendingAuth, authID)
		return oauth.PendingAuthorization{}, oauth.ErrAuthorizationNotFound
	}

	return auth, nil
}

func (s *AuthStoreImpl) DeletePendingAuth(authID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.pendingAuth[authID]; !exists {
		return oauth.ErrAuthorizationNotFound
	}

	delete(s.pendingAuth, authID)
	return nil
}

func (s *AuthStoreImpl) StoreAuthorizationCode(code string, auth oauth.AuthorizationCode) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.authCodes[code] = auth

	// Clean up expired codes
	go func() {
		time.Sleep(time.Until(auth.ExpiresAt))
		s.mu.Lock()
		delete(s.authCodes, code)
		s.mu.Unlock()
	}()

	return nil
}

func (s *AuthStoreImpl) GetAuthorizationCode(code string) (oauth.AuthorizationCode, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	auth, exists := s.authCodes[code]
	if !exists {
		return oauth.AuthorizationCode{}, oauth.ErrAuthorizationNotFound
	}

	if time.Now().After(auth.ExpiresAt) {
		delete(s.authCodes, code)
		return oauth.AuthorizationCode{}, oauth.ErrAuthorizationNotFound
	}

	return auth, nil
}

// Add the missing DeleteAuthorizationCode method
func (s *AuthStoreImpl) DeleteAuthorizationCode(code string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.authCodes[code]; !exists {
		return oauth.ErrAuthorizationNotFound
	}

	delete(s.authCodes, code)
	return nil
}

// UserServiceImpl implements the oauth.UserService interface
type UserServiceImpl struct {
	users map[string]string // username -> password
}

func NewUserService() *UserServiceImpl {
	return &UserServiceImpl{
		users: map[string]string{ // This is for test/learning purposes and absolutely not going to be used moving forward.
			"testuser": "testpass", // This is for test/learning purposes and absolutely not going to be used moving forward.
		},
	}
}

func (s *UserServiceImpl) ValidateCredentials(username, password string) (bool, error) {
	storedPassword, exists := s.users[username]
	if !exists {
		return false, nil
	}
	return storedPassword == password, nil
}

// TokenStoreImpl implements the oauth.TokenStore interface
type TokenStoreImpl struct {
	mu     sync.RWMutex
	tokens map[string]*oauth.Token
}

func NewTokenStore() *TokenStoreImpl {
	return &TokenStoreImpl{
		tokens: make(map[string]*oauth.Token),
	}
}

func (s *TokenStoreImpl) StoreToken(token *oauth.Token) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.tokens[token.TokenID] = token

	// Start cleanup goroutine
	go func() {
		time.Sleep(time.Until(token.ExpiresAt))
		s.mu.Lock()
		delete(s.tokens, token.TokenID)
		s.mu.Unlock()
	}()

	return nil
}

func (s *TokenStoreImpl) GetToken(tokenID string) (*oauth.Token, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	token, exists := s.tokens[tokenID]
	if !exists {
		return nil, oauth.ErrAuthorizationNotFound
	}

	if time.Now().After(token.ExpiresAt) {
		delete(s.tokens, tokenID)
		return nil, oauth.ErrAuthorizationNotFound
	}

	if token.IsRevoked {
		return nil, oauth.ErrAuthorizationNotFound
	}

	return token, nil
}

func (s *TokenStoreImpl) RevokeToken(tokenID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	token, exists := s.tokens[tokenID]
	if !exists {
		return oauth.ErrAuthorizationNotFound
	}

	token.IsRevoked = true
	return nil
}

func (s *TokenStoreImpl) RevokeAllUserTokens(userID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	for _, token := range s.tokens {
		if token.UserID == userID {
			token.IsRevoked = true
		}
	}

	return nil
}
