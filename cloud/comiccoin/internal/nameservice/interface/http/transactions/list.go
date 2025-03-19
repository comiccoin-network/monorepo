// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/nameservice/interface/http/list/list.go
package list

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	dom_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/nameservice/domain/user"
	svc_transactions "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/nameservice/service/transactions"
)

type GetUserTransactionsHTTPHandler struct {
	config   *config.Configuration
	logger   *slog.Logger
	dbClient *mongo.Client
	service  svc_transactions.GetUserTransactionsService
}

func NewGetUserTransactionsHTTPHandler(
	config *config.Configuration,
	logger *slog.Logger,
	dbClient *mongo.Client,
	service svc_transactions.GetUserTransactionsService,
) *GetUserTransactionsHTTPHandler {
	return &GetUserTransactionsHTTPHandler{
		config:   config,
		logger:   logger,
		dbClient: dbClient,
		service:  service,
	}
}

func (h *GetUserTransactionsHTTPHandler) Execute(w http.ResponseWriter, r *http.Request) {
	// Set response content type
	w.Header().Set("Content-Type", "application/json")

	ctx := r.Context()

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
		response, err := h.service.Execute(sessCtx)
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
	resp := result.([]*dom_user.UserClaimedCoinTransaction)
	if err := json.NewEncoder(w).Encode(resp); err != nil {
		h.logger.Error("failed to encode response",
			slog.Any("error", err))
		httperror.ResponseError(w, err)
		return
	}

}
