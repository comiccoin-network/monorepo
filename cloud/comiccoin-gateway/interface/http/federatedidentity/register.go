// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/interface/http/federatedidentity/register.go
package federatedidentity

import (
	"encoding/json"
	"log/slog"
	"net/http"

	svc_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/service/federatedidentity"
)

type RegisterHandler struct {
	logger          *slog.Logger
	registerService svc_federatedidentity.RegisterService
}

func NewRegisterHandler(logger *slog.Logger, registerService svc_federatedidentity.RegisterService) *RegisterHandler {
	return &RegisterHandler{
		logger:          logger,
		registerService: registerService,
	}
}

func (h *RegisterHandler) Execute(w http.ResponseWriter, r *http.Request) {
	h.logger.Debug("handling registration request",
		"method", r.Method,
		"path", r.URL.Path)

	var req svc_federatedidentity.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	resp, err := h.registerService.Register(r.Context(), &req, r.RemoteAddr)
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
