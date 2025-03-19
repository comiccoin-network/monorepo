// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/nameservice/interface/http/hello/hello.go
package claimcoins

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	svc_claimcoins "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/nameservice/service/claimcoins"
)

type PostClaimCoinsHTTPHandler struct {
	config   *config.Configuration
	logger   *slog.Logger
	dbClient *mongo.Client
	service  svc_claimcoins.ClaimCoinsService
}

func NewPostClaimCoinsHTTPHandler(
	config *config.Configuration,
	logger *slog.Logger,
	dbClient *mongo.Client,
	service svc_claimcoins.ClaimCoinsService,
) *PostClaimCoinsHTTPHandler {
	return &PostClaimCoinsHTTPHandler{
		config:   config,
		logger:   logger,
		dbClient: dbClient,
		service:  service,
	}
}

func (h *PostClaimCoinsHTTPHandler) Execute(w http.ResponseWriter, r *http.Request) {
	h.logger.Debug("starting...")

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
			h.logger.Error("failed to claim coins",
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
	resp := result.(*svc_claimcoins.ClaimCoinsResponse)
	if err := json.NewEncoder(w).Encode(resp); err != nil {
		h.logger.Error("failed to encode response",
			slog.Any("error", err))
		httperror.ResponseError(w, err)
		return
	}

}
