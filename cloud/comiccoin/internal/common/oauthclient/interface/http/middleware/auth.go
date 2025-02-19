// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/interface/http/middleware/auth.go
package middleware

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"strings"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/service/introspection"
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
			http.Error(w, "missing authorization header", http.StatusUnauthorized)
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			m.logger.Warn("invalid authorization header format")
			http.Error(w, "invalid authorization header format", http.StatusUnauthorized)
			return
		}

		token := parts[1]

		m.logger.Debug("submitting into inspeciton...", slog.Any("token_id", token))

		// First, introspect token with OAuth server to get basic info
		introspectResp, err := m.introspectionService.IntrospectToken(r.Context(), &introspection.IntrospectionRequest{
			Token: token,
			// Don't require FederatedIdentityID for initial introspection
		})
		if err != nil {
			m.logger.Error("failed to introspect token",
				slog.Any("error", err))
			http.Error(w, fmt.Sprintf("failed to introspect token: %v", err), http.StatusUnauthorized)
			return
		}

		if !introspectResp.Active {
			m.logger.Warn("token is not active")
			http.Error(w, "token is not active", http.StatusUnauthorized)
			return
		}

		// Add federatedidentity ID to context
		if !introspectResp.FederatedIdentityID.IsZero() {
			ctx := context.WithValue(r.Context(), "federatedidentity_id", introspectResp.FederatedIdentityID)
			ctx = context.WithValue(ctx, "access_token", token)
			m.logger.Debug("attached authenticated federatedidentity to the context",
				slog.Any("federatedidentity_id", introspectResp.FederatedIdentityID),
				slog.Any("token_id", token))
			next.ServeHTTP(w, r.WithContext(ctx))
		} else {
			m.logger.Warn("no federatedidentity associated with token")
			http.Error(w, "no federatedidentity associated with token", http.StatusUnauthorized)
		}
	}
}
