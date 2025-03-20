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

type ListBlockTransactionsByAddressHTTPHandler struct {
	logger  *slog.Logger
	service sv_blocktx.ListBlockTransactionsByAddressService
}

func NewListBlockTransactionsByAddressHTTPHandler(
	logger *slog.Logger,
	s1 sv_blocktx.ListBlockTransactionsByAddressService,
) *ListBlockTransactionsByAddressHTTPHandler {
	return &ListBlockTransactionsByAddressHTTPHandler{logger, s1}
}

func (h *ListBlockTransactionsByAddressHTTPHandler) Execute(w http.ResponseWriter, r *http.Request) {
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

	// Note: Optional field
	filterByType := query.Get("type")
	if filterByType != "" {
		if filterByType != "coin" && filterByType != "token" {
			err := httperror.NewForNotFoundWithSingleField("type", "Type only accepted options are `coin` or `token`")
			httperror.ResponseError(w, err)
			return
		}
	}

	address := common.HexToAddress(strings.ToLower(addressStr))
	blockTxs, err := h.service.Execute(ctx, &address, filterByType)
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
