package handler

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"strings"

	"github.com/ethereum/go-ethereum/common"

	sv_blocktx "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/service/blocktx"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
)

type ListOwnedTokenBlockTransactionsByAddressHTTPHandler struct {
	logger  *slog.Logger
	service sv_blocktx.ListOwnedTokenBlockTransactionsByAddressService
}

func NewListOwnedTokenBlockTransactionsByAddressHTTPHandler(
	logger *slog.Logger,
	s1 sv_blocktx.ListOwnedTokenBlockTransactionsByAddressService,
) *ListOwnedTokenBlockTransactionsByAddressHTTPHandler {
	return &ListOwnedTokenBlockTransactionsByAddressHTTPHandler{logger, s1}
}

func (h *ListOwnedTokenBlockTransactionsByAddressHTTPHandler) Execute(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	h.logger.Debug("Blocktx by address requested")

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
