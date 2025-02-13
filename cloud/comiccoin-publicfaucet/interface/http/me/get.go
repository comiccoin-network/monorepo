// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/interface/http/me/get.go
package me

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/config"
	svc_me "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/service/me"
)

type GetMeHTTPHandler struct {
	config   *config.Configuration
	logger   *slog.Logger
	dbClient *mongo.Client
	service  svc_me.GetMeAfterRemoteSyncService
}

func NewGetMeHTTPHandler(
	config *config.Configuration,
	logger *slog.Logger,
	dbClient *mongo.Client,
	service svc_me.GetMeAfterRemoteSyncService,
) *GetMeHTTPHandler {
	return &GetMeHTTPHandler{
		config:   config,
		logger:   logger,
		dbClient: dbClient,
		service:  service,
	}
}

func (h *GetMeHTTPHandler) Execute(w http.ResponseWriter, r *http.Request) {
	// Set response content type
	w.Header().Set("Content-Type", "application/json")

	ctx := r.Context()

	var shouldSyncNow bool
	shouldSyncNowQuery := r.URL.Query().Get("should_sync_now")
	if shouldSyncNowQuery == "true" || shouldSyncNowQuery == "True" || shouldSyncNowQuery == "1" {
		shouldSyncNow = true
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
		response, err := h.service.Execute(r.Context(), shouldSyncNow)
		if err != nil {
			h.logger.Error("failed to get me",
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
	resp := result.(svc_me.MeResponseDTO)
	if err := json.NewEncoder(w).Encode(resp); err != nil {
		h.logger.Error("failed to encode response",
			slog.Any("error", err))
		httperror.ResponseError(w, err)
		return
	}

}
