// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oregistrationclient/interface/http/handler/oregistration/registrationurl.go
package oauth

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/config"
	service_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/service/oauth"
)

type GetRegistrationURLHTTPHandler struct {
	config  *config.Configuration
	logger  *slog.Logger
	service service_oauth.GetRegistrationURLService
}

func NewGetRegistrationURLHTTPHandler(
	config *config.Configuration,
	logger *slog.Logger,
	service service_oauth.GetRegistrationURLService,
) *GetRegistrationURLHTTPHandler {
	return &GetRegistrationURLHTTPHandler{
		config:  config,
		logger:  logger,
		service: service,
	}
}

type registrationUrlRequestIDO struct {
	RedirectURI string `json:"redirect_uri"`
	Scope       string `json:"scope"`
}

type registrationUrlResponseIDO struct {
	RegistrationURL string `json:"registration_url"`
	State           string `json:"state"`
	ExpiresAt       int64  `json:"expires_at"`
}

func (h *GetRegistrationURLHTTPHandler) Execute(w http.ResponseWriter, r *http.Request) {
	// Set response content type
	w.Header().Set("Content-Type", "application/json")

	// Call service
	response, err := h.service.Execute(r.Context())
	if err != nil {
		h.logger.Error("failed to get registrationorization URL",
			slog.Any("error", err))
		httperror.ResponseError(w, err)
		return
	}

	// Convert service response to IDO
	responseIDO := registrationUrlResponseIDO{
		RegistrationURL: response.RegistrationURL,
		State:           response.State,
		ExpiresAt:       response.ExpiresAt.Unix(),
	}

	// Encode response
	if err := json.NewEncoder(w).Encode(responseIDO); err != nil {
		h.logger.Error("failed to encode response",
			slog.Any("error", err))
		httperror.ResponseError(w, err)
		return
	}

	h.logger.Info("registrationorization URL generated successfully",
		slog.String("state", response.State))
}
