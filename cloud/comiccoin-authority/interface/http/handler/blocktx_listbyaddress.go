package handler

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"strings"

	"github.com/ethereum/go-ethereum/common"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	s_blocktx "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/service/blocktx"
)

type ListBlockTransactionsByAddressHTTPHandler struct {
	logger  *slog.Logger
	service *s_blocktx.ListBlockTransactionsByAddressService
}

func NewListBlockTransactionsByAddressHTTPHandler(
	logger *slog.Logger,
	s1 *s_blocktx.ListBlockTransactionsByAddressService,
) *ListBlockTransactionsByAddressHTTPHandler {
	return &ListBlockTransactionsByAddressHTTPHandler{logger, s1}
}

func (h *ListBlockTransactionsByAddressHTTPHandler) Execute(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	h.logger.Debug("Blockchain state requested")

	// Here is where you extract url parameters.
	query := r.URL.Query()

	addressStr := query.Get("address")
	if addressStr == "" {
		err := httperror.NewForNotFoundWithSingleField("address", "missing value")
		httperror.ResponseError(w, err)
		return
	}

	address := common.HexToAddress(strings.ToLower(addressStr))
	blockTxs, err := h.service.Execute(ctx, &address)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(&blockTxs); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
