// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/interface/http/me/connectwallet.go
package me

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"strings"

	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/config"
	svc_me "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/service/me"
)

type PostMeConnectWalletHTTPHandler struct {
	config   *config.Configuration
	logger   *slog.Logger
	dbClient *mongo.Client
	service  svc_me.MeConnectWalletService
}

func NewPostMeConnectWalletHTTPHandler(
	config *config.Configuration,
	logger *slog.Logger,
	dbClient *mongo.Client,
	service svc_me.MeConnectWalletService,
) *PostMeConnectWalletHTTPHandler {
	return &PostMeConnectWalletHTTPHandler{
		config:   config,
		logger:   logger,
		dbClient: dbClient,
		service:  service,
	}
}

func (h *PostMeConnectWalletHTTPHandler) unmarshalRequest(
	ctx context.Context,
	r *http.Request,
) (*svc_me.MeConnectWalletRequestDTO, error) {
	// Initialize our array which will store all the results from the remote server.
	var requestData svc_me.MeConnectWalletRequestDTO

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

	// Defensive Code: For security purposes we need to remove all whitespaces from the email and lower the characters.
	requestData.WalletAddress = strings.ToLower(requestData.WalletAddress)
	requestData.WalletAddress = strings.ReplaceAll(requestData.WalletAddress, " ", "")

	return &requestData, nil
}

func (h *PostMeConnectWalletHTTPHandler) Execute(w http.ResponseWriter, r *http.Request) {
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
			h.logger.Error("failed to say hello",
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

	// Since we updated the user's account, just return a success status
	// with no content returned.
	w.WriteHeader(http.StatusNoContent)
}
