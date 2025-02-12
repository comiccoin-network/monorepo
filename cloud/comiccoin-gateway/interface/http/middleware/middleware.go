package middleware

import (
	"log/slog"
	"net/http"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/security/blacklist"
	ipcb "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/security/ipcountryblocker"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/security/jwt"
	uc_bannedipaddress "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/usecase/bannedipaddress"
	uc_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/usecase/federatedidentity"
)

type Middleware interface {
	Attach(fn http.HandlerFunc) http.HandlerFunc
	Shutdown()
}

type middleware struct {
	logger                              *slog.Logger
	blacklist                           blacklist.Provider
	jwt                                 jwt.Provider
	federatedidentityGetBySessionIDUseCase           uc_federatedidentity.FederatedIdentityGetBySessionIDUseCase
	bannedIPAddressListAllValuesUseCase uc_bannedipaddress.BannedIPAddressListAllValuesUseCase
	IPCountryBlocker                    ipcb.Provider
}

func NewMiddleware(
	loggerp *slog.Logger,
	blp blacklist.Provider,
	ipcountryblocker ipcb.Provider,
	jwtp jwt.Provider,
	uc1 uc_federatedidentity.FederatedIdentityGetBySessionIDUseCase,
	uc2 uc_bannedipaddress.BannedIPAddressListAllValuesUseCase,
) Middleware {
	return &middleware{
		logger:                              loggerp,
		blacklist:                           blp,
		IPCountryBlocker:                    ipcountryblocker,
		jwt:                                 jwtp,
		federatedidentityGetBySessionIDUseCase:           uc1,
		bannedIPAddressListAllValuesUseCase: uc2,
	}
}

// Attach function attaches to HTTP router to apply for every API call.
func (mid *middleware) Attach(fn http.HandlerFunc) http.HandlerFunc {
	mid.logger.Debug("middleware executed")
	// Attach our middleware handlers here. Please note that all our middleware
	// will start from the bottom and proceed upwards.
	// Ex: `RateLimitMiddleware` will be executed first and
	//     `ProtectedURLsMiddleware` will be executed last.
	// fn = mid.ProtectedURLsMiddleware(fn) //TODO: INTEGRATE WHEN READY WITH OAUTH
	// fn = mid.PostJWTProcessorMiddleware(fn) // Note: Must be above `JWTProcessorMiddleware`. //TODO: INTEGRATE WHEN READY WITH OAUTH
	// fn = mid.JWTProcessorMiddleware(fn)     // Note: Must be above `PreJWTProcessorMiddleware`. //TODO: INTEGRATE WHEN READY WITH OAUTH
	// fn = mid.PreJWTProcessorMiddleware(fn)  // Note: Must be above `URLProcessorMiddleware` and `IPAddressMiddleware`. //TODO: INTEGRATE WHEN READY WITH OAUTH
	fn = mid.EnforceRestrictCountryIPsMiddleware(fn)
	fn = mid.EnforceBlacklistMiddleware(fn)
	fn = mid.IPAddressMiddleware(fn)
	fn = mid.URLProcessorMiddleware(fn)
	fn = mid.RateLimitMiddleware(fn)

	return func(w http.ResponseWriter, r *http.Request) {
		// Flow to the next middleware.
		fn(w, r)
	}
}

// Shutdown shuts down the middleware.
func (mid *middleware) Shutdown() {
	// Log a message to indicate that the HTTP server is shutting down.
	mid.logger.Info("Gracefully shutting down HTTP middleware")
	mid.IPCountryBlocker.Close()
}
