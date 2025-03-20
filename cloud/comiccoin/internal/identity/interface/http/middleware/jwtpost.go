package middleware

import (
	"context"
	"log/slog"
	"net/http"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config/constants"
)

func (mid *middleware) PostJWTProcessorMiddleware(fn http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		mid.logger.Debug("PostJWTProcessorMiddleware starting up...")
		ctx := r.Context()

		// Get our authorization information.
		isAuthorized, ok := ctx.Value(constants.SessionIsAuthorized).(bool)
		if ok && isAuthorized {
			sessionID := ctx.Value(constants.SessionID).(string)

			// Lookup our user profile in the session or return 500 error.
			user, err := mid.userGetBySessionIDUseCase.Execute(ctx, sessionID)
			if err != nil {
				mid.logger.Warn("GetUserBySessionID error", slog.Any("err", err), slog.Any("middleware", "PostJWTProcessorMiddleware"))
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			// If no user was found then that means our session expired and the
			// user needs to login or use the refresh token.
			if user == nil {
				mid.logger.Warn("Session expired - please log in again", slog.Any("middleware", "PostJWTProcessorMiddleware"))
				http.Error(w, "attempting to access a protected endpoint", http.StatusUnauthorized)
				return
			}

			// // If system administrator disabled the user account then we need
			// // to generate a 403 error letting the user know their account has
			// // been disabled and you cannot access the protected API endpoint.
			// if user.State == 0 {
			// 	http.Error(w, "Account disabled - please contact admin", http.StatusForbidden)
			// 	return
			// }

			// Save our user information to the context.
			// Save our user.
			ctx = context.WithValue(ctx, constants.SessionUser, user)

			// For debugging purposes only.
			mid.logger.Debug("Fetched session record",
				slog.Any("ID", user.ID),
				slog.String("SessionID", sessionID),
				slog.String("Name", user.Name),
				slog.String("FirstName", user.FirstName),
				slog.String("Email", user.Email))

			// Save individual pieces of the user profile.
			ctx = context.WithValue(ctx, constants.SessionID, sessionID)
			ctx = context.WithValue(ctx, constants.SessionUserID, user.ID)
			ctx = context.WithValue(ctx, constants.SessionUserRole, user.Role)
			ctx = context.WithValue(ctx, constants.SessionUserName, user.Name)
			ctx = context.WithValue(ctx, constants.SessionUserFirstName, user.FirstName)
			ctx = context.WithValue(ctx, constants.SessionUserLastName, user.LastName)
			ctx = context.WithValue(ctx, constants.SessionUserTimezone, user.Timezone)
			// ctx = context.WithValue(ctx, constants.SessionUserStoreID, user.StoreID)
			// ctx = context.WithValue(ctx, constants.SessionUserStoreName, user.StoreName)
			// ctx = context.WithValue(ctx, constants.SessionUserStoreLevel, user.StoreLevel)
			// ctx = context.WithValue(ctx, constants.SessionUserStoreTimezone, user.StoreTimezone)
		}

		fn(w, r.WithContext(ctx))
	}
}
