// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/interface/http/federatedidentity/update.go
package federatedidentity

import (
	"encoding/json"
	"log/slog"
	"net/http"

	svc_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/service/federatedidentity"
)

type UpdateFederatedIdentityHandler struct {
	logger  *slog.Logger
	service svc_federatedidentity.UpdateFederatedIdentityService
}

func NewUpdateFederatedIdentityHandler(logger *slog.Logger, service svc_federatedidentity.UpdateFederatedIdentityService) *UpdateFederatedIdentityHandler {
	return &UpdateFederatedIdentityHandler{
		logger:  logger,
		service: service,
	}
}

func (h *UpdateFederatedIdentityHandler) Execute(w http.ResponseWriter, r *http.Request) {
	h.logger.Debug("handling registration request",
		"method", r.Method,
		"path", r.URL.Path)

	var req svc_federatedidentity.UpdateFederatedIdentityRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	resp, err := h.service.Execute(r.Context(), &req)
	if err != nil {
		h.logger.Error("registration failed",
			"error", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	h.logger.Debug("registrated successfully",
		"resp", resp)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
