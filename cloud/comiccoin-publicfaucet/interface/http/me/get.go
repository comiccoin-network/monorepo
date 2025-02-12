// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/interface/http/me/get.go
package me

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/config"
	svc_me "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/service/me"
)

type GetMeHTTPHandler struct {
	config  *config.Configuration
	logger  *slog.Logger
	service svc_me.GetMeAfterRemoteSyncService
}

func NewGetMeHTTPHandler(
	config *config.Configuration,
	logger *slog.Logger,
	service svc_me.GetMeAfterRemoteSyncService,
) *GetMeHTTPHandler {
	return &GetMeHTTPHandler{
		config:  config,
		logger:  logger,
		service: service,
	}
}

func (h *GetMeHTTPHandler) Execute(w http.ResponseWriter, r *http.Request) {
	// Set response content type
	w.Header().Set("Content-Type", "application/json")

	var shouldSyncNow bool
	shouldSyncNowQuery := r.URL.Query().Get("should_sync_now")
	if shouldSyncNowQuery == "true" || shouldSyncNowQuery == "True" || shouldSyncNowQuery == "1" {
		shouldSyncNow = true
	}

	// Call service
	response, err := h.service.Execute(r.Context(), shouldSyncNow)
	if err != nil {
		h.logger.Error("failed to get me",
			slog.Any("error", err))
		httperror.ResponseError(w, err)
		return
	}

	// Encode response
	if err := json.NewEncoder(w).Encode(response); err != nil {
		h.logger.Error("failed to encode response",
			slog.Any("error", err))
		httperror.ResponseError(w, err)
		return
	}

}
