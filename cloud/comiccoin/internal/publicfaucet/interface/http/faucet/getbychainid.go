// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/interface/http/faucet/getbychainid.go
package faucet

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"strconv"

	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	svc_faucet "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/service/faucet"
)

type GetFaucetByChainIDHTTPHandler struct {
	config   *config.Configuration
	logger   *slog.Logger
	dbClient *mongo.Client
	service  svc_faucet.GetFaucetService
}

func NewGetFaucetByChainIDHTTPHandler(
	config *config.Configuration,
	logger *slog.Logger,
	dbClient *mongo.Client,
	service svc_faucet.GetFaucetService,
) *GetFaucetByChainIDHTTPHandler {
	return &GetFaucetByChainIDHTTPHandler{
		config:   config,
		logger:   logger,
		dbClient: dbClient,
		service:  service,
	}
}

func (h *GetFaucetByChainIDHTTPHandler) Execute(w http.ResponseWriter, r *http.Request, chainIDString string) {
	// Set response content type
	w.Header().Set("Content-Type", "application/json")

	ctx := r.Context()

	chainID64, err := strconv.ParseUint(chainIDString, 10, 64)
	if err != nil {
		h.logger.Error("failed to parse chain id",
			slog.Any("error", err))
		httperror.ResponseError(w, err)
		return
	}

	////
	//// Start the transaction.
	////

	session, err := h.dbClient.StartSession()
	if err != nil {
		h.logger.Error("start session error",
			slog.Any("error", err))
		httperror.ResponseError(w, err)
		return
	}
	defer session.EndSession(ctx)

	// Define a transaction function with a series of operations
	transactionFunc := func(sessCtx mongo.SessionContext) (interface{}, error) {

		// Call service
		response, err := h.service.ExecuteByChainID(sessCtx, uint16(chainID64))
		if err != nil {
			h.logger.Error("failed to get faucet by chain id",
				slog.Any("error", err))
			return nil, err
		}
		return response, nil
	}

	// Start a transaction
	result, txErr := session.WithTransaction(ctx, transactionFunc)
	if txErr != nil {
		h.logger.Error("session failed error",
			slog.Any("error", txErr))
		httperror.ResponseError(w, txErr)
		return
	}

	// Encode response
	resp := result.(*svc_faucet.FaucetDTO)
	if err := json.NewEncoder(w).Encode(resp); err != nil {
		h.logger.Error("failed to encode response",
			slog.Any("error", err))
		httperror.ResponseError(w, err)
		return
	}

}
