// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/interface/http/middleware/middleware.go
package middleware

import (
	"context"
	"log/slog"
	"net/http"

	common_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/blacklist"
	ipcb "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/ipcountryblocker"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/jwt"
	uc_bannedipaddress "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/usecase/bannedipaddress"
)

type Middleware interface {
	Attach(fn http.HandlerFunc) http.HandlerFunc
	Shutdown(ctx context.Context)
}

type middleware struct {
	logger                              *slog.Logger
	blacklist                           blacklist.Provider
	jwt                                 jwt.Provider
	bannedIPAddressListAllValuesUseCase uc_bannedipaddress.BannedIPAddressListAllValuesUseCase
	IPCountryBlocker                    ipcb.Provider
	oauthClientManager                  common_oauth.Manager
}

func NewMiddleware(
	loggerp *slog.Logger,
	blp blacklist.Provider,
	ipcountryblocker ipcb.Provider,
	jwtp jwt.Provider,
	uc2 uc_bannedipaddress.BannedIPAddressListAllValuesUseCase,
	manager common_oauth.Manager,
) Middleware {
	return &middleware{
		logger:                              loggerp,
		blacklist:                           blp,
		IPCountryBlocker:                    ipcountryblocker,
		jwt:                                 jwtp,
		bannedIPAddressListAllValuesUseCase: uc2,
		oauthClientManager:                  manager,
	}
}

// Attach function attaches to HTTP router to apply for every API call.
func (mid *middleware) Attach(fn http.HandlerFunc) http.HandlerFunc {
	mid.logger.Debug("middleware executed")

	return func(w http.ResponseWriter, r *http.Request) {
		// Apply base middleware to all requests
		handler := mid.applyBaseMiddleware(fn)

		// Check if the path requires authentication
		if isProtectedPath(r.URL.Path) {
			mid.logger.Debug("applying auth_middleware...")

			// Apply auth middleware for protected paths
			handler = mid.oauthClientManager.AuthMiddleware().Authenticate(handler)
		}

		handler(w, r)
	}
}

// Attach function attaches to HTTP router to apply for every API call.
func (mid *middleware) applyBaseMiddleware(fn http.HandlerFunc) http.HandlerFunc {
	mid.logger.Debug("middleware executed")
	// Apply middleware in reverse order (bottom up)
	handler := fn
	handler = mid.EnforceRestrictCountryIPsMiddleware(handler)
	handler = mid.EnforceBlacklistMiddleware(handler)
	handler = mid.IPAddressMiddleware(handler)
	handler = mid.URLProcessorMiddleware(handler)
	handler = mid.RateLimitMiddleware(handler)

	return handler
}

// Shutdown shuts down the middleware.
func (mid *middleware) Shutdown(ctx context.Context) {
	// Log a message to indicate that the HTTP server is shutting down.
	mid.logger.Info("Gracefully shutting down HTTP middleware")
	mid.IPCountryBlocker.Close()
}
