package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	_ "time/tzdata"

	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/httperror"
	sv_gateway "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/service/gateway"
)

type GatewayChangePasswordHTTPHandler struct {
	logger   *slog.Logger
	dbClient *mongo.Client
	service  sv_gateway.GatewayChangePasswordService
}

func NewGatewayChangePasswordHTTPHandler(
	logger *slog.Logger,
	dbClient *mongo.Client,
	service sv_gateway.GatewayChangePasswordService,
) *GatewayChangePasswordHTTPHandler {
	return &GatewayChangePasswordHTTPHandler{
		logger:   logger,
		dbClient: dbClient,
		service:  service,
	}
}

func (h *GatewayChangePasswordHTTPHandler) unmarshalChangePasswordRequest(
	ctx context.Context,
	r *http.Request,
) (*sv_gateway.GatewayChangePasswordRequestIDO, error) {
	// Initialize our array which will store all the results from the remote server.
	var requestData sv_gateway.GatewayChangePasswordRequestIDO

	defer r.Body.Close()

	var rawJSON bytes.Buffer
	teeReader := io.TeeReader(r.Body, &rawJSON) // TeeReader allows you to read the JSON and capture it

	// Read the JSON string and convert it into our golang stuct else we need
	// to send a `400 Bad Request` errror message back to the client,
	err := json.NewDecoder(teeReader).Decode(&requestData) // [1]
	if err != nil {
		h.logger.Error("decoding error",
			slog.Any("err", err),
			slog.String("json", rawJSON.String()),
		)
		return nil, httperror.NewForSingleField(http.StatusBadRequest, "non_field_error", "payload structure is wrong")
	}

	return &requestData, nil
}

func (h *GatewayChangePasswordHTTPHandler) Execute(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	data, err := h.unmarshalChangePasswordRequest(ctx, r)
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
		err := h.service.Execute(sessCtx, data)
		if err != nil {
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

	w.WriteHeader(http.StatusNoContent)
}
