// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/interface/http/user/register.go
package user

import (
	"encoding/json"
	"log/slog"
	"net/http"

	svc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/service/user"
)

type RegisterHandler struct {
	logger          *slog.Logger
	registerService svc_user.RegisterService
}

func NewRegisterHandler(logger *slog.Logger, registerService svc_user.RegisterService) *RegisterHandler {
	return &RegisterHandler{
		logger:          logger,
		registerService: registerService,
	}
}

func (h *RegisterHandler) Execute(w http.ResponseWriter, r *http.Request) {
	h.logger.Info("handling registration request",
		"method", r.Method,
		"path", r.URL.Path)

	var req svc_user.RegisterRequest
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

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
