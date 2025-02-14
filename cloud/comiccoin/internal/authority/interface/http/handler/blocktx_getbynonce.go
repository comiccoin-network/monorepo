package handler

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"math/big"
	"net/http"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	sv_blocktx "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/service/blocktx"
)

type GetBlockTransactionByNonceHTTPHandler struct {
	logger  *slog.Logger
	service sv_blocktx.GetBlockTransactionService
}

func NewGetBlockTransactionByNonceHTTPHandler(
	logger *slog.Logger,
	s1 sv_blocktx.GetBlockTransactionService,
) *GetBlockTransactionByNonceHTTPHandler {
	return &GetBlockTransactionByNonceHTTPHandler{logger, s1}
}

func (h *GetBlockTransactionByNonceHTTPHandler) ExecuteByNonce(w http.ResponseWriter, r *http.Request, transactionNonceStr string) {
	ctx := r.Context()
	h.logger.Debug("BlockData requested by transaction nonce")

	transactionNonce, ok := new(big.Int).SetString(transactionNonceStr, 10)
	if !ok {
		err := fmt.Errorf("Failed converting: %s", transactionNonceStr)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	resp, err := h.service.ExecuteByNonce(ctx, transactionNonce)
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
