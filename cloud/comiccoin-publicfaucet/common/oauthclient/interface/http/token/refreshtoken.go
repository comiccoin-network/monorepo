// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/interface/http/token/refreshtoken.go
package handler

import (
	"encoding/json"
	"io"
	"log/slog"
	"net/http"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/config"
	service_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/service/token"
)

type PostTokenRefreshHTTPHandler struct {
	config  *config.Configuration
	logger  *slog.Logger
	service service_token.RefreshTokenService
}

func NewPostTokenRefreshHTTPHandler(
	config *config.Configuration,
	logger *slog.Logger,
	service service_token.RefreshTokenService,
) *PostTokenRefreshHTTPHandler {
	return &PostTokenRefreshHTTPHandler{
		config:  config,
		logger:  logger,
		service: service,
	}
}

type tokenRefreshRequestIDO struct {
	UserID       string `json:"user_id"`
	RefreshToken string `json:"refresh_token"`
}

type tokenRefreshResponseIDO struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	TokenType    string `json:"token_type"`
	ExpiresIn    int    `json:"expires_in"`
}

func (h *PostTokenRefreshHTTPHandler) Execute(w http.ResponseWriter, r *http.Request) {
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
	var requestIDO tokenRefreshRequestIDO
	if err := json.Unmarshal(body, &requestIDO); err != nil {
		h.logger.Error("failed to unmarshal request body",
			slog.Any("error", err))
		httperror.ResponseError(w, httperror.NewForBadRequest(nil))
		return
	}

	// Convert user_id string to ObjectID
	userID, err := primitive.ObjectIDFromHex(requestIDO.UserID)
	if err != nil {
		h.logger.Error("invalid user_id format",
			slog.String("user_id", requestIDO.UserID),
			slog.Any("error", err))
		httperror.ResponseError(w, httperror.NewForBadRequest(nil))
		return
	}

	// Convert IDO to service request
	request := &service_token.RefreshRequest{
		UserID:       userID,
		RefreshToken: requestIDO.RefreshToken,
	}

	// Call service
	response, err := h.service.RefreshToken(r.Context(), request)
	if err != nil {
		h.logger.Error("token refresh failed",
			slog.Any("user_id", request.UserID),
			slog.Any("error", err))
		httperror.ResponseError(w, err)
		return
	}

	// Convert service response to IDO
	responseIDO := tokenRefreshResponseIDO{
		AccessToken:  response.AccessToken,
		RefreshToken: response.RefreshToken,
		TokenType:    response.TokenType,
		ExpiresIn:    response.ExpiresIn,
	}

	// Encode response
	if err := json.NewEncoder(w).Encode(responseIDO); err != nil {
		h.logger.Error("failed to encode response",
			slog.Any("error", err))
		httperror.ResponseError(w, err)
		return
	}

	h.logger.Info("token refresh processed successfully",
		slog.Any("user_id", request.UserID))
}
