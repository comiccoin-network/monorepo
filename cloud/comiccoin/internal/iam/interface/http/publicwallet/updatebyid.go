// cloud/comiccoin/internal/iam/interface/http/publicwallet/updatebyid.go
package publicwallet

import (
	"bytes"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	svc "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/service/publicwallet"
)

type UpdatePublicWalletByIDHTTPHandler interface {
	Handle(w http.ResponseWriter, r *http.Request, idStr string)
}

type updatePublicWalletByIDHTTPHandlerImpl struct {
	config   *config.Configuration
	logger   *slog.Logger
	dbClient *mongo.Client
	service  svc.UpdatePublicWalletByIDService
}

func NewUpdatePublicWalletByIDHTTPHandler(
	config *config.Configuration,
	logger *slog.Logger,
	dbClient *mongo.Client,
	service svc.UpdatePublicWalletByIDService,
) UpdatePublicWalletByIDHTTPHandler {
	return &updatePublicWalletByIDHTTPHandlerImpl{
		config:   config,
		logger:   logger,
		dbClient: dbClient,
		service:  service,
	}
}

func (h *updatePublicWalletByIDHTTPHandlerImpl) Handle(w http.ResponseWriter, r *http.Request, idStr string) {
	ctx := r.Context()

	// Parse request
	defer r.Body.Close()
	var requestData svc.UpdatePublicWalletRequestIDO

	var rawJSON bytes.Buffer
	teeReader := io.TeeReader(r.Body, &rawJSON) // TeeReader allows you to read the JSON and capture it

	// Read the JSON string and convert it into our golang stuct else we need
	// to send a `400 Bad Request` errror message back to the client,
	err := json.NewDecoder(teeReader).Decode(&requestData)
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
		id, err := primitive.ObjectIDFromHex(idStr)
		if err != nil {
			return nil, err
		}

		// Set ID from URL
		requestData.ID = id

		// Execute service
		err = h.service.UpdateByID(sessCtx, &requestData)
		if err != nil {
			return nil, err
		}
		return nil, nil
	}

	// Return response
	_, txErr := session.WithTransaction(ctx, txFunc)
	if txErr != nil {
		h.logger.Error("transaction failed", slog.Any("error", txErr))
		httperror.ResponseError(w, txErr)
		return
	}

	// Return success response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"public_wallet": requestData,
	})
}
