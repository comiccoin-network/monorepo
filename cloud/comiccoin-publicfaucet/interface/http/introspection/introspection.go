// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/interface/http/introspection/introspection.go
package introspection

import (
	"encoding/json"
	"io"
	"log/slog"
	"net/http"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/config"
	service_introspection "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/service/introspection"
)

type PostTokenIntrospectionHTTPHandler struct {
	config  *config.Configuration
	logger  *slog.Logger
	service service_introspection.IntrospectionService
}

func NewPostTokenIntrospectionHTTPHandler(
	config *config.Configuration,
	logger *slog.Logger,
	service service_introspection.IntrospectionService,
) *PostTokenIntrospectionHTTPHandler {
	return &PostTokenIntrospectionHTTPHandler{
		config:  config,
		logger:  logger,
		service: service,
	}
}

type tokenIntrospectionRequestIDO struct {
	AccessToken string `json:"access_token"`
	UserID      string `json:"user_id"`
}

type tokenIntrospectionResponseIDO struct {
	Active      bool   `json:"active"`
	Scope       string `json:"scope,omitempty"`
	ClientID    string `json:"client_id,omitempty"`
	ExpiresAt   int64  `json:"expires_at,omitempty"`
	IssuedAt    int64  `json:"issued_at,omitempty"`
	UserID      string `json:"user_id,omitempty"`
	Email       string `json:"email,omitempty"`
	FirstName   string `json:"first_name,omitempty"`
	LastName    string `json:"last_name,omitempty"`
	RequiresOTP bool   `json:"requires_otp"`
}

func (h *PostTokenIntrospectionHTTPHandler) Execute(w http.ResponseWriter, r *http.Request) {
	// Set response content type
	w.Header().Set("Content-Type", "application/json")

	// Read request body
	body, err := io.ReadAll(r.Body)
	if err != nil {
		h.logger.Error("failed to read request body",
			slog.Any("error", err))
		httperror.ResponseError(w, httperror.NewForBadRequest(nil))
		return
	}
	defer r.Body.Close()

	// Parse request body
	var requestIDO tokenIntrospectionRequestIDO
	if err := json.Unmarshal(body, &requestIDO); err != nil {
		h.logger.Error("failed to unmarshal request body",
			slog.Any("error", err))
		httperror.ResponseError(w, httperror.NewForBadRequest(nil))
		return
	}

	// Convert IDO to service request
	request := &service_introspection.IntrospectionRequest{
		AccessToken: requestIDO.AccessToken,
		UserID:      requestIDO.UserID,
	}

	// Call service
	response, err := h.service.IntrospectToken(r.Context(), request)
	if err != nil {
		h.logger.Error("token introspection failed",
			slog.String("user_id", request.UserID),
			slog.Any("error", err))
		httperror.ResponseError(w, err)
		return
	}

	// Convert service response to IDO
	responseIDO := tokenIntrospectionResponseIDO{
		Active:      response.Active,
		RequiresOTP: response.RequiresOTP,
	}

	// Only include additional fields if token is active
	if response.Active {
		responseIDO.Scope = response.Scope
		responseIDO.ClientID = response.ClientID
		responseIDO.ExpiresAt = response.ExpiresAt.Unix()
		responseIDO.IssuedAt = response.IssuedAt.Unix()
		if response.User != nil {
			responseIDO.UserID = response.User.ID.Hex()
			responseIDO.Email = response.User.Email
			responseIDO.FirstName = response.User.FirstName
			responseIDO.LastName = response.User.LastName
		}
	}

	// Encode response
	if err := json.NewEncoder(w).Encode(responseIDO); err != nil {
		h.logger.Error("failed to encode response",
			slog.Any("error", err))
		httperror.ResponseError(w, err)
		return
	}

	h.logger.Info("token introspection processed successfully",
		slog.String("user_id", request.UserID),
		slog.Bool("active", response.Active))
}
