package handler

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/domain"
	sv_mempooltx "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/service/mempooltx"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
)

type MempoolTransactionReceiveDTOFromNetworkServiceHTTPHandler struct {
	logger  *slog.Logger
	service sv_mempooltx.MempoolTransactionReceiveDTOFromNetworkService
}

func NewMempoolTransactionReceiveDTOFromNetworkServiceHTTPHandler(
	logger *slog.Logger,
	s sv_mempooltx.MempoolTransactionReceiveDTOFromNetworkService,
) *MempoolTransactionReceiveDTOFromNetworkServiceHTTPHandler {
	return &MempoolTransactionReceiveDTOFromNetworkServiceHTTPHandler{logger, s}
}

type BlockchainMempoolTransactionReceiveDTOFromNetworkServiceResponseIDO struct {
}

func (h *MempoolTransactionReceiveDTOFromNetworkServiceHTTPHandler) Execute(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Initialize our array which will store all the results from the remote server.
	var requestData *domain.MempoolTransactionDTO

	defer r.Body.Close()

	// Read the JSON string and convert it into our golang stuct else we need
	// to send a `400 Bad Request` errror message back to the client,
	err := json.NewDecoder(r.Body).Decode(&requestData) // [1]
	if err != nil {
		httperror.ResponseError(w, httperror.NewForSingleField(http.StatusBadRequest, "non_field_error", "payload structure is wrong"))
	}

	serviceExecErr := h.service.Execute(
		ctx,
		requestData,
	)
	if serviceExecErr != nil {
		httperror.ResponseError(w, serviceExecErr)
		return
	}

	w.WriteHeader(http.StatusCreated)
}
