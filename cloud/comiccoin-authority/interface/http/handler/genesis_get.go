package handler

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	s_genesis "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/service/genesis"
)

type GetGenesisBlockDataHTTPHandler struct {
	logger  *slog.Logger
	service *s_genesis.GetGenesisBlockDataService
}

func NewGetGenesisBlockDataHTTPHandler(
	logger *slog.Logger,
	s1 *s_genesis.GetGenesisBlockDataService,
) *GetGenesisBlockDataHTTPHandler {
	return &GetGenesisBlockDataHTTPHandler{logger, s1}
}

func (h *GetGenesisBlockDataHTTPHandler) Execute(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	h.logger.Debug("Genesis block data requested")

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

	genesis, err := h.service.Execute(ctx, uint16(chainID))
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(&genesis); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
