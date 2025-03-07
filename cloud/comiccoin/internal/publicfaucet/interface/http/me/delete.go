// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/interface/http/me/delete.go
package me

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"

	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	svc_me "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/service/me"
)

type DeleteMeHTTPHandler struct {
	config   *config.Configuration
	logger   *slog.Logger
	dbClient *mongo.Client
	service  svc_me.DeleteMeService
}

func NewDeleteMeHTTPHandler(
	config *config.Configuration,
	logger *slog.Logger,
	dbClient *mongo.Client,
	service svc_me.DeleteMeService,
) *DeleteMeHTTPHandler {
	return &DeleteMeHTTPHandler{
		config:   config,
		logger:   logger,
		dbClient: dbClient,
		service:  service,
	}
}

func (h *DeleteMeHTTPHandler) unmarshalRequest(
	ctx context.Context,
	r *http.Request,
) (*svc_me.DeleteMeRequestDTO, error) {
	// Initialize our structure which will store the parsed request data
	var requestData svc_me.DeleteMeRequestDTO

	defer r.Body.Close()

	var rawJSON bytes.Buffer
	teeReader := io.TeeReader(r.Body, &rawJSON) // TeeReader allows you to read the JSON and capture it

	// Read the JSON string and convert it into our golang struct else we need
	// to send a `400 Bad Request` error message back to the client
	err := json.NewDecoder(teeReader).Decode(&requestData)
	if err != nil {
		h.logger.Error("decoding error",
			slog.Any("err", err),
			slog.String("json", rawJSON.String()),
		)
		return nil, httperror.NewForSingleField(http.StatusBadRequest, "non_field_error", "payload structure is wrong")
	}

	return &requestData, nil
}

func (h *DeleteMeHTTPHandler) Execute(w http.ResponseWriter, r *http.Request) {
	// Set response content type
	w.Header().Set("Content-Type", "application/json")

	ctx := r.Context()

	req, err := h.unmarshalRequest(ctx, r)
	if err != nil {
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
		err := h.service.Execute(sessCtx, req)
		if err != nil {
			h.logger.Error("failed to delete account",
				slog.Any("error", err))
			return nil, err
		}
		return nil, nil
	}

	// Start a transaction
	_, txErr := session.WithTransaction(ctx, transactionFunc)
	if txErr != nil {
		h.logger.Error("session failed error",
			slog.Any("error", txErr))
		httperror.ResponseError(w, txErr)
		return
	}

	// Return successful no content response since the account was deleted
	w.WriteHeader(http.StatusNoContent)
}
