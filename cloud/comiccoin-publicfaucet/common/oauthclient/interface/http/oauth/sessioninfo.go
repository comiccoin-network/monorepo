// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/interface/http/handler/oauth/sessioninfo.go
package oauth

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/config"
	service_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/service/oauth"
)

type OAuthSessionInfoHTTPHandler struct {
	config  *config.Configuration
	logger  *slog.Logger
	service service_oauth.OAuthSessionInfoService
}

func NewOAuthSessionInfoHTTPHandler(
	config *config.Configuration,
	logger *slog.Logger,
	service service_oauth.OAuthSessionInfoService,
) *OAuthSessionInfoHTTPHandler {
	return &OAuthSessionInfoHTTPHandler{
		config:  config,
		logger:  logger,
		service: service,
	}
}

type sessionInfoResponseIDO struct {
	Valid       bool   `json:"valid"`
	FederatedIdentityID      string `json:"federatedidentity_id,omitempty"`
	Email       string `json:"email,omitempty"`
	FirstName   string `json:"first_name,omitempty"`
	LastName    string `json:"last_name,omitempty"`
	ExpiresAt   int64  `json:"expires_at,omitempty"`
	LastUsedAt  int64  `json:"last_used_at,omitempty"`
	RequiresOTP bool   `json:"requires_otp"`
}

func (h *OAuthSessionInfoHTTPHandler) Execute(w http.ResponseWriter, r *http.Request) {
	// Set response content type
	w.Header().Set("Content-Type", "application/json")

	// Get session ID from cookie
	cookie, err := r.Cookie("session_id")
	if err != nil {
		if err == http.ErrNoCookie {
			h.logger.Warn("no session cookie found")
			// Return invalid session response rather than error
			json.NewEncoder(w).Encode(sessionInfoResponseIDO{Valid: false})
			return
		}
		h.logger.Error("failed to get session cookie",
			slog.Any("error", err))
		httperror.ResponseError(w, err)
		return
	}

	// Create service request
	request := &service_oauth.OAuthSessionInfoRequest{
		SessionID: cookie.Value,
	}

	// Call service
	response, err := h.service.GetSessionInfo(r.Context(), request)
	if err != nil {
		h.logger.Error("failed to get session info",
			slog.String("session_id", cookie.Value),
			slog.Any("error", err))
		httperror.ResponseError(w, err)
		return
	}

	// Convert service response to IDO
	responseIDO := sessionInfoResponseIDO{
		Valid:       response.Valid,
		RequiresOTP: response.RequiresOTP,
	}

	// Only include additional information if session is valid
	if response.Valid && response.FederatedIdentity != nil {
		responseIDO.FederatedIdentityID = response.FederatedIdentity.ID.Hex()
		responseIDO.Email = response.FederatedIdentity.Email
		responseIDO.FirstName = response.FederatedIdentity.FirstName
		responseIDO.LastName = response.FederatedIdentity.LastName
		responseIDO.ExpiresAt = response.ExpiresAt.Unix()
		responseIDO.LastUsedAt = response.LastUsedAt.Unix()
	}

	// Encode response
	if err := json.NewEncoder(w).Encode(responseIDO); err != nil {
		h.logger.Error("failed to encode response",
			slog.Any("error", err))
		httperror.ResponseError(w, err)
		return
	}

	h.logger.Info("session info request processed",
		slog.String("session_id", cookie.Value),
		slog.Bool("valid", response.Valid))
}
