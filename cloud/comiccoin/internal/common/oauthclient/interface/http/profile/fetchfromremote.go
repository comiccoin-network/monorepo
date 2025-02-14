package profile

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"strings"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/config"
	service_profile "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/service/profile"
)

type FetchProfileFromComicCoinGatewayHandler struct {
	config  *config.Configuration
	logger  *slog.Logger
	service service_profile.FetchProfileFromComicCoinGatewayService
}

func NewFetchProfileFromComicCoinGatewayHandler(
	config *config.Configuration,
	logger *slog.Logger,
	service service_profile.FetchProfileFromComicCoinGatewayService,
) *FetchProfileFromComicCoinGatewayHandler {
	return &FetchProfileFromComicCoinGatewayHandler{
		config:  config,
		logger:  logger,
		service: service,
	}
}

// handleProfileRequest is an HTTP handler function to fetch the profile.
func (h *FetchProfileFromComicCoinGatewayHandler) Execute(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	ctx := r.Context()

	// Extract accessToken from request (e.g., from Authorization header or cookie)
	accessToken := r.Header.Get("Authorization")
	if accessToken == "" {
		httperror.ResponseError(w, httperror.NewForUnauthorizedWithSingleField("message", "Access token required"))
		return
	}
	accessToken = strings.TrimPrefix(accessToken, "Bearer ")

	profile, err := h.service.Execute(ctx, accessToken)
	if err != nil {
		slog.Error("Failed fetching profile", "error", err)
		httperror.ResponseError(w, err)
		return
	}

	// Encode the response
	if err := json.NewEncoder(w).Encode(profile); err != nil {
		slog.Error("Failed encoding profile response", "error", err)
		httperror.ResponseError(w, err)
		return
	}
}
