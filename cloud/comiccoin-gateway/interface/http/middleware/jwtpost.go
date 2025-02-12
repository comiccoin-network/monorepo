package middleware

import (
	"context"
	"log/slog"
	"net/http"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/config/constants"
)

func (mid *middleware) PostJWTProcessorMiddleware(fn http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()

		// Skip this middleware if federatedidentity is on a whitelisted URL path.
		skipAuthorization, ok := ctx.Value(constants.SessionSkipAuthorization).(bool)
		if ok && skipAuthorization {
			// mid.logger.Warn("Skipping authorization")
			fn(w, r.WithContext(ctx)) // Flow to the next middleware.
			return
		}

		// Get our authorization information.
		isAuthorized, ok := ctx.Value(constants.SessionIsAuthorized).(bool)
		if ok && isAuthorized {
			sessionID := ctx.Value(constants.SessionID).(string)

			// Lookup our federatedidentity profile in the session or return 500 error.
			federatedidentity, err := mid.federatedidentityGetBySessionIDUseCase.Execute(ctx, sessionID)
			if err != nil {
				mid.logger.Warn("GetFederatedIdentityBySessionID error", slog.Any("err", err), slog.Any("middleware", "PostJWTProcessorMiddleware"))
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			// If no federatedidentity was found then that means our session expired and the
			// federatedidentity needs to login or use the refresh token.
			if federatedidentity == nil {
				mid.logger.Warn("Session expired - please log in again", slog.Any("middleware", "PostJWTProcessorMiddleware"))
				http.Error(w, "attempting to access a protected endpoint", http.StatusUnauthorized)
				return
			}

			// // If system administrator disabled the federatedidentity account then we need
			// // to generate a 403 error letting the federatedidentity know their account has
			// // been disabled and you cannot access the protected API endpoint.
			// if federatedidentity.State == 0 {
			// 	http.Error(w, "Account disabled - please contact admin", http.StatusForbidden)
			// 	return
			// }

			// Save our federatedidentity information to the context.
			// Save our federatedidentity.
			ctx = context.WithValue(ctx, constants.SessionFederatedIdentity, federatedidentity)

			// // For debugging purposes only.
			// mid.logger.Debug("Fetched session record",
			// 	slog.Any("ID", federatedidentity.ID),
			// 	slog.String("SessionID", sessionID),
			// 	slog.String("Name", federatedidentity.Name),
			// 	slog.String("FirstName", federatedidentity.FirstName),
			// 	slog.String("Email", federatedidentity.Email))

			// Save individual pieces of the federatedidentity profile.
			ctx = context.WithValue(ctx, constants.SessionID, sessionID)
			ctx = context.WithValue(ctx, constants.SessionFederatedIdentityID, federatedidentity.ID)
			ctx = context.WithValue(ctx, constants.SessionFederatedIdentityRole, federatedidentity.Role)
			ctx = context.WithValue(ctx, constants.SessionFederatedIdentityName, federatedidentity.Name)
			ctx = context.WithValue(ctx, constants.SessionFederatedIdentityFirstName, federatedidentity.FirstName)
			ctx = context.WithValue(ctx, constants.SessionFederatedIdentityLastName, federatedidentity.LastName)
			ctx = context.WithValue(ctx, constants.SessionFederatedIdentityTimezone, federatedidentity.Timezone)
			// ctx = context.WithValue(ctx, constants.SessionFederatedIdentityStoreID, federatedidentity.StoreID)
			// ctx = context.WithValue(ctx, constants.SessionFederatedIdentityStoreName, federatedidentity.StoreName)
			// ctx = context.WithValue(ctx, constants.SessionFederatedIdentityStoreLevel, federatedidentity.StoreLevel)
			// ctx = context.WithValue(ctx, constants.SessionFederatedIdentityStoreTimezone, federatedidentity.StoreTimezone)
		}

		fn(w, r.WithContext(ctx))
	}
}
