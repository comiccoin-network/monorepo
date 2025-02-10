// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/interface/http/login/login.go
package handler

import (
	"encoding/json"
	"io"
	"log/slog"
	"net/http"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/config"
	service_login "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/service/login"
)

type PostLoginHTTPHandler struct {
	config  *config.Configuration
	logger  *slog.Logger
	service service_login.LoginService
}

func NewPostLoginHTTPHandler(
	config *config.Configuration,
	logger *slog.Logger,
	service service_login.LoginService,
) *PostLoginHTTPHandler {
	return &PostLoginHTTPHandler{
		config:  config,
		logger:  logger,
		service: service,
	}
}

type loginRequestIDO struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	AppID    string `json:"app_id"`
	AuthFlow string `json:"auth_flow"`
}

type loginResponseIDO struct {
	AuthCode      string `json:"auth_code,omitempty"`
	RedirectURI   string `json:"redirect_uri,omitempty"`
	AccessToken   string `json:"access_token,omitempty"`
	RefreshToken  string `json:"refresh_token,omitempty"`
	TokenType     string `json:"token_type,omitempty"`
	ExpiresIn     int    `json:"expires_in,omitempty"`
	HasOTPEnabled bool   `json:"has_otp_enabled"`
	OTPValidated  bool   `json:"otp_validated,omitempty"`
}

func (h *PostLoginHTTPHandler) Execute(w http.ResponseWriter, r *http.Request) {
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
	var requestIDO loginRequestIDO
	if err := json.Unmarshal(body, &requestIDO); err != nil {
		h.logger.Error("failed to unmarshal request body",
			slog.Any("error", err))
		httperror.ResponseError(w, httperror.NewForBadRequest(nil))
		return
	}

	// Convert IDO to service request
	request := &service_login.LoginRequest{
		Email:    requestIDO.Email,
		Password: requestIDO.Password,
		AppID:    requestIDO.AppID,
		AuthFlow: requestIDO.AuthFlow,
	}

	// Call service
	response, err := h.service.ProcessLogin(r.Context(), request)
	if err != nil {
		h.logger.Error("login process failed",
			slog.String("email", request.Email),
			slog.Any("error", err))
		httperror.ResponseError(w, err)
		return
	}

	// Convert service response to IDO
	responseIDO := loginResponseIDO{
		AuthCode:      response.AuthCode,
		RedirectURI:   response.RedirectURI,
		AccessToken:   response.AccessToken,
		RefreshToken:  response.RefreshToken,
		TokenType:     response.TokenType,
		ExpiresIn:     response.ExpiresIn,
		HasOTPEnabled: response.HasOTPEnabled,
		OTPValidated:  response.OTPValidated,
	}

	// Encode response
	if err := json.NewEncoder(w).Encode(responseIDO); err != nil {
		h.logger.Error("failed to encode response",
			slog.Any("error", err))
		httperror.ResponseError(w, err)
		return
	}

	h.logger.Info("login request processed successfully",
		slog.String("email", request.Email))
}
