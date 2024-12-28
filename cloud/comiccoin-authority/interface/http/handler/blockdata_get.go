package handler

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"math/big"
	"net/http"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/service"
)

type GetBlockDataHTTPHandler struct {
	logger  *slog.Logger
	service *service.GetBlockDataService
}

func NewGetBlockDataHTTPHandler(
	logger *slog.Logger,
	s1 *service.GetBlockDataService,
) *GetBlockDataHTTPHandler {
	return &GetBlockDataHTTPHandler{logger, s1}
}

func (h *GetBlockDataHTTPHandler) ExecuteByHash(w http.ResponseWriter, r *http.Request, hash string) {
	ctx := r.Context()
	h.logger.Debug("BlockData requested by hash")

	resp, err := h.service.ExecuteByHash(ctx, hash)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(&resp); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (h *GetBlockDataHTTPHandler) ExecuteByHeaderNumber(w http.ResponseWriter, r *http.Request, headerNumberStr string) {
	ctx := r.Context()
	h.logger.Debug("BlockData requested by header number")

	headerNumber, ok := new(big.Int).SetString(headerNumberStr, 10)
	if !ok {
		err := fmt.Errorf("Failed converting: %s", headerNumberStr)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	resp, err := h.service.ExecuteByHeaderNumber(ctx, headerNumber)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(&resp); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
