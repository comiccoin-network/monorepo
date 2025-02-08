// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/interface/http/system/version.go
package system

import (
	"encoding/json"
	"log/slog"
	"net/http"
)

type GetVersionHTTPHandler struct {
	logger *slog.Logger
}

func NewGetVersionHTTPHandler(
	logger *slog.Logger,
) *GetVersionHTTPHandler {
	return &GetVersionHTTPHandler{logger}
}

type VersionResponseIDO struct {
	Version string `json:"version"`
}

func (h *GetVersionHTTPHandler) Execute(w http.ResponseWriter, r *http.Request) {
	// Set the content type of the response to application/json.
	w.Header().Set("Content-Type", "application/json")

	h.logger.Debug("Version requested")
	response := VersionResponseIDO{Version: "1.0"}
	json.NewEncoder(w).Encode(response)
}
