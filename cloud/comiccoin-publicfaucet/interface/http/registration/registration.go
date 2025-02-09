// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/interface/http/registration/registration.go
package registration

import (
	"encoding/json"
	"io"
	"log/slog"
	"net/http"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/config"
	dom_registration "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/domain/registration"
	service_registration "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/service/registration"
)

type PostRegistrationHTTPHandler struct {
	config  *config.Configuration
	logger  *slog.Logger
	service service_registration.RegistrationService
}

func NewPostRegistrationHTTPHandler(
	config *config.Configuration,
	logger *slog.Logger,
	service service_registration.RegistrationService,
) *PostRegistrationHTTPHandler {
	return &PostRegistrationHTTPHandler{
		config:  config,
		logger:  logger,
		service: service,
	}
}

type registrationRequestIDO struct {
	Email     string `json:"email"`
	Password  string `json:"password"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Phone     string `json:"phone"`
	Country   string `json:"country"`
	Timezone  string `json:"timezone"`
	AgreeTOS  bool   `json:"agree_tos"`
	AppID     string `json:"app_id"`
	AuthFlow  string `json:"auth_flow"`
}

type registrationResponseIDO struct {
	AuthCode    string `json:"auth_code,omitempty"`
	RedirectURI string `json:"redirect_uri,omitempty"`
}

func (h *PostRegistrationHTTPHandler) Execute(w http.ResponseWriter, r *http.Request) {
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
	var requestIDO registrationRequestIDO
	if err := json.Unmarshal(body, &requestIDO); err != nil {
		h.logger.Error("failed to unmarshal request body",
			slog.Any("error", err))
		httperror.ResponseError(w, httperror.NewForBadRequest(nil))
		return
	}

	// Convert IDO to domain model
	request := &dom_registration.RegistrationRequest{
		Email:       requestIDO.Email,
		Password:    requestIDO.Password,
		FirstName:   requestIDO.FirstName,
		LastName:    requestIDO.LastName,
		Phone:       requestIDO.Phone,
		Country:     requestIDO.Country,
		Timezone:    requestIDO.Timezone,
		AgreeTOS:    requestIDO.AgreeTOS,
		AppID:       h.config.OAuth.ClientID,
		AuthFlow:    requestIDO.AuthFlow,
		RedirectURI: h.config.OAuth.RedirectURI,
	}

	// Call service
	response, err := h.service.ProcessRegistration(r.Context(), request)
	if err != nil {
		h.logger.Error("registration process failed",
			slog.String("email", request.Email),
			slog.Any("error", err))
		httperror.ResponseError(w, err)
		return
	}

	// Convert domain model to IDO
	responseIDO := registrationResponseIDO{
		AuthCode:    response.AuthCode,
		RedirectURI: response.RedirectURI,
	}

	// Encode response
	if err := json.NewEncoder(w).Encode(responseIDO); err != nil {
		h.logger.Error("failed to encode response",
			slog.Any("error", err))
		httperror.ResponseError(w, err)
		return
	}

	h.logger.Info("registration request processed successfully",
		slog.String("email", request.Email))
}
