// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/interface/http/introspection/introspection.go
package introspection

import (
	"encoding/json"
	"io"
	"log/slog"
	"net/http"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/config"
	service_introspection "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/service/introspection"
	"go.mongodb.org/mongo-driver/bson/primitive"
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
	AccessToken         string `json:"access_token"`
	FederatedIdentityID string `json:"federatedidentity_id"`
}

type tokenIntrospectionResponseIDO struct {
	Active              bool               `json:"active"`
	FederatedIdentityID primitive.ObjectID `json:"federatedidentity_id,omitempty"`
	Email               string             `json:"email,omitempty"`
	FirstName           string             `json:"first_name,omitempty"`
	LastName            string             `json:"last_name,omitempty"`
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
		Token:               requestIDO.AccessToken,
		FederatedIdentityID: requestIDO.FederatedIdentityID,
	}

	// Call service
	response, err := h.service.IntrospectToken(r.Context(), request)
	if err != nil {
		h.logger.Error("token introspection failed",
			slog.String("federatedidentity_id", request.FederatedIdentityID),
			slog.Any("error", err))
		httperror.ResponseError(w, err)
		return
	}

	// Convert service response to IDO
	responseIDO := tokenIntrospectionResponseIDO{
		Active:              response.Active,
		FederatedIdentityID: response.FederatedIdentityID,
		Email:               response.Email,
		FirstName:           response.FirstName,
		LastName:            response.LastName,
	}

	// Encode response
	if err := json.NewEncoder(w).Encode(responseIDO); err != nil {
		h.logger.Error("failed to encode response",
			slog.Any("error", err))
		httperror.ResponseError(w, err)
		return
	}

	h.logger.Info("token introspection processed successfully",
		slog.String("federatedidentity_id", request.FederatedIdentityID),
		slog.Bool("active", response.Active))
}
