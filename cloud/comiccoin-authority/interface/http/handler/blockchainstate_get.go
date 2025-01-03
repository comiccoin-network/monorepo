package handler

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/service"
)

type GetBlockchainStateHTTPHandler struct {
	logger  *slog.Logger
	service *service.GetBlockchainStateService
}

func NewGetBlockchainStateHTTPHandler(
	logger *slog.Logger,
	s1 *service.GetBlockchainStateService,
) *GetBlockchainStateHTTPHandler {
	return &GetBlockchainStateHTTPHandler{logger, s1}
}

func (h *GetBlockchainStateHTTPHandler) Execute(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	h.logger.Debug("Blockchain state requested")

	// Here is where you extract url parameters.
	query := r.URL.Query()

	chainIDstr := query.Get("chain_id")
	if chainIDstr == "" {
		chainIDstr = "1"
	}
	chainID, err := strconv.ParseInt(chainIDstr, 0, 16)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	blockchainState, err := h.service.Execute(ctx, uint16(chainID))
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(&blockchainState); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
