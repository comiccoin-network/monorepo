package handler

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"strings"

	svc_account "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/service/account"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/ethereum/go-ethereum/common"
)

type GetAccountBalanceHTTPHandler struct {
	logger  *slog.Logger
	service svc_account.GetAccountService
}

func NewGetAccountBalanceHTTPHandler(
	logger *slog.Logger,
	s1 svc_account.GetAccountService,
) *GetAccountBalanceHTTPHandler {
	return &GetAccountBalanceHTTPHandler{logger, s1}
}

func (h *GetAccountBalanceHTTPHandler) Execute(w http.ResponseWriter, r *http.Request) {

	ctx := r.Context()
	h.logger.Debug("Account balance requested")

	// Here is where you extract url parameters.
	query := r.URL.Query()

	addressStr := query.Get("address")
	if addressStr == "" {
		err := httperror.NewForNotFoundWithSingleField("address", "Address is a required parameter in the url")
		httperror.ResponseError(w, err)
		return
	}
	address := common.HexToAddress(strings.ToLower(addressStr))

	account, err := h.service.Execute(ctx, &address)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	if account != nil {
		w.WriteHeader(http.StatusOK)
		resp := map[string]uint64{}
		resp["balance"] = account.Balance
		if err := json.NewEncoder(w).Encode(resp); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	} else {
		w.WriteHeader(http.StatusNotFound)
	}
}
