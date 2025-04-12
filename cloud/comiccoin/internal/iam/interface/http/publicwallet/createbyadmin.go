// cloud/comiccoin/internal/iam/interface/http/publicwallet/createbyadmin.go
package publicwallet

import (
	"bytes"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"

	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	svc "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/service/publicwallet"
)

type CreatePublicWalletByAdminHTTPHandler interface {
	Handle(w http.ResponseWriter, r *http.Request)
}

type createPublicWalletByAdminHTTPHandlerImpl struct {
	config   *config.Configuration
	logger   *slog.Logger
	dbClient *mongo.Client
	service  svc.CreatePublicWalletByAdminService
}

func NewCreatePublicWalletByAdminHTTPHandler(
	config *config.Configuration,
	logger *slog.Logger,
	dbClient *mongo.Client,
	service svc.CreatePublicWalletByAdminService,
) CreatePublicWalletByAdminHTTPHandler {
	return &createPublicWalletByAdminHTTPHandlerImpl{
		config:   config,
		logger:   logger,
		dbClient: dbClient,
		service:  service,
	}
}

func (h *createPublicWalletByAdminHTTPHandlerImpl) Handle(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Parse request
	defer r.Body.Close()
	var requestData svc.CreatePublicWalletByAdminRequestIDO

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
		httperror.ResponseError(w, err)
		return
	}

	// Start database transaction
	session, err := h.dbClient.StartSession()
	if err != nil {
		h.logger.Error("start session error", slog.Any("error", err))
		httperror.ResponseError(w, err)
		return
	}
	defer session.EndSession(ctx)

	// Execute transaction
	txFunc := func(sessCtx mongo.SessionContext) (interface{}, error) {

		// Execute service
		resp, txErr := h.service.Create(sessCtx, &requestData)
		if txErr != nil {
			h.logger.Error("failed to create public wallet", slog.Any("error", txErr))
			return nil, txErr
		}

		return resp, nil
	}

	// Return response
	txResult, txErr := session.WithTransaction(ctx, txFunc)
	if txErr != nil {
		h.logger.Error("transaction failed", slog.Any("error", txErr))
		httperror.ResponseError(w, txErr)
		return
	}

	// Return response
	resp := txResult.(*svc.CreatePublicWalletByAdminResponseIDO)
	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(resp); err != nil {
		h.logger.Error("failed to encode response", slog.Any("error", err))
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
