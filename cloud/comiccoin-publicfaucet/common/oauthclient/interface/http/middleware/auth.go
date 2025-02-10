// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/interface/http/middleware/auth.go
package middleware

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"strings"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/service/introspection"
)

type AuthMiddleware struct {
	config               *config.Configuration
	logger               *slog.Logger
	introspectionService introspection.IntrospectionService
}

func NewAuthMiddleware(
	config *config.Configuration,
	logger *slog.Logger,
	introspectionService introspection.IntrospectionService,
) *AuthMiddleware {
	return &AuthMiddleware{
		config:               config,
		logger:               logger,
		introspectionService: introspectionService,
	}
}

func (m *AuthMiddleware) Authenticate(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Extract token from Authorization header
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			m.logger.Warn("missing authorization header")
			httperror.ResponseError(w, httperror.NewForUnauthorizedWithSingleField("message", "missing authorization header"))
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			m.logger.Warn("invalid authorization header format")
			httperror.ResponseError(w, httperror.NewForUnauthorizedWithSingleField("message", "invalid authorization header format"))
			return
		}

		token := parts[1]

		m.logger.Debug("submitting into inspeciton...", slog.Any("token_id", token))

		// First, introspect token with OAuth server to get basic info
		introspectResp, err := m.introspectionService.IntrospectToken(r.Context(), &introspection.IntrospectionRequest{
			Token: token,
			// Don't require UserID for initial introspection
		})
		if err != nil {
			m.logger.Error("failed to introspect token",
				slog.Any("error", err))
			httperror.ResponseError(w, httperror.NewForUnauthorizedWithSingleField("message", fmt.Sprintf("failed to introspect token: %v", err)))
			return
		}

		if !introspectResp.Active {
			m.logger.Warn("token is not active")
			httperror.ResponseError(w, httperror.NewForUnauthorizedWithSingleField("message", "token is not active"))
			return
		}

		// Add user ID to context
		if !introspectResp.UserID.IsZero() {
			ctx := context.WithValue(r.Context(), "user_id", introspectResp.UserID)
			m.logger.Debug("attached authenticated user to the context",
				slog.Any("user_id", introspectResp.UserID),
				slog.Any("token_id", token))
			next.ServeHTTP(w, r.WithContext(ctx))
		} else {
			m.logger.Warn("no user associated with token")
			httperror.ResponseError(w, httperror.NewForUnauthorizedWithSingleField("message", "no user associated with token"))
		}
	}
}
