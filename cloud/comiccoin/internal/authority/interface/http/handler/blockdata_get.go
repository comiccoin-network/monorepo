package handler

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"math/big"
	"net/http"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	sv_blockdata "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/service/blockdata"
)

type GetBlockDataHTTPHandler struct {
	logger  *slog.Logger
	service sv_blockdata.GetBlockDataService
}

func NewGetBlockDataHTTPHandler(
	logger *slog.Logger,
	s1 sv_blockdata.GetBlockDataService,
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

func (h *GetBlockDataHTTPHandler) ExecuteByTransactionNonce(w http.ResponseWriter, r *http.Request, transactionNonceStr string) {
	ctx := r.Context()
	h.logger.Debug("BlockData requested by transaction nonce")

	transactionNonce, ok := new(big.Int).SetString(transactionNonceStr, 10)
	if !ok {
		err := fmt.Errorf("Failed converting: %s", transactionNonceStr)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	resp, err := h.service.ExecuteByTransactionNonce(ctx, transactionNonce)
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
