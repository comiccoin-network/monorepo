// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/interface/http/middleware/jwtpre.go
package middleware

import (
	"context"
	"net/http"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/config/constants"
)

// PreJWTProcessorMiddleware checks to see if we are visiting an unprotected URL and if so then
// let the system know we need to skip authorization handling.
func (mid *middleware) PreJWTProcessorMiddleware(fn http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Open our program's context based on the request and save the
		// slash-seperated array from our URL path.
		ctx := r.Context()

		// The following code will lookup the URL path in a whitelist and
		// if the visited path matches then we will skip URL protection.
		// We do this because a majority of API endpoints are protected
		// by authorization.

		urlSplit := ctx.Value("url_split").([]string)
		skipPath := map[string]bool{
			"health-check":    true,
			"version":         true,
			"greeting":        true,
			"login":           true,
			"refresh-token":   true,
			"register":        true,
			"verify":          true,
			"forgot-password": true,
			"password-reset":  true,
			"cpsrn":           true,
			"select-options":  true,
			"public":          true,
		}

		// DEVELOPERS NOTE:
		// If the URL cannot be split into the size then do not skip authorization.
		if len(urlSplit) < 3 {
			// mid.Logger.Warn("Skipping authorization | len less then 3")
			ctx = context.WithValue(ctx, constants.SessionSkipAuthorization, false)
			fn(w, r.WithContext(ctx)) // Flow to the next middleware.
			return
		}

		// Skip authorization if the URL matches the whitelist else we need to
		// run authorization check.
		if skipPath[urlSplit[2]] {
			// mid.Logger.Warn("Skipping authorization | skipPath found")
			ctx = context.WithValue(ctx, constants.SessionSkipAuthorization, true)
		} else {
			// For debugging purposes only.
			// log.Println("PreJWTProcessorMiddleware | Protected URL detected")
			// log.Println("PreJWTProcessorMiddleware | urlSplit:", urlSplit)
			// log.Println("PreJWTProcessorMiddleware | urlSplit[2]:", urlSplit[2])
			ctx = context.WithValue(ctx, constants.SessionSkipAuthorization, false)
		}

		// Flow to the next middleware.
		fn(w, r.WithContext(ctx))
	}
}
