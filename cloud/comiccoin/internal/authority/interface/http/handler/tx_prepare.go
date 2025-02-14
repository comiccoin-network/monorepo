package handler

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	sv_tx "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/service/tx"
)

type PrepareTransactionHTTPHandler struct {
	logger  *slog.Logger
	service sv_tx.PrepareTransactionService
}

func NewPrepareTransactionHTTPHandler(
	logger *slog.Logger,
	s1 sv_tx.PrepareTransactionService,
) *PrepareTransactionHTTPHandler {
	return &PrepareTransactionHTTPHandler{logger, s1}
}

func unmarshalPrepareTransactionRequest(ctx context.Context, r *http.Request) (*sv_tx.PrepareTransactionRequestIDO, error) {
	// Initialize our array which will store all the results from the remote server.
	var requestData *sv_tx.PrepareTransactionRequestIDO

	defer r.Body.Close()

	// Read the JSON string and convert it into our golang stuct else we need
	// to send a `400 Bad Request` errror message back to the client,
	err := json.NewDecoder(r.Body).Decode(&requestData) // [1]
	if err != nil {
		return nil, httperror.NewForSingleField(http.StatusBadRequest, "non_field_error", "payload structure is wrong")
	}

	return requestData, nil
}

func (h *PrepareTransactionHTTPHandler) Execute(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	req, err := unmarshalPrepareTransactionRequest(ctx, r)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	// toAddr := common.HexToAddress(strings.ToLower(req.RecipientAddress))
	// senderAddr := common.HexToAddress(strings.ToLower(req.SenderAccountAddress))
	//
	// h.logger.Debug("tx submit received",
	// 	slog.Any("sender", senderAddr),
	// 	slog.Any("receipient", toAddr),
	// 	slog.Any("value", req.Value),
	// 	slog.Any("data", req.Data))

	preparedTx, err := h.service.Execute(ctx, req)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(&preparedTx); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
