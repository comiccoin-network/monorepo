// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/interface/http/user/update.go
package user

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
	svc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/service/user"
)

type UpdateUserHTTPHandler interface {
	Handle(w http.ResponseWriter, r *http.Request, idStr string)
}

type updateUserHTTPHandlerImpl struct {
	config   *config.Configuration
	logger   *slog.Logger
	dbClient *mongo.Client
	service  svc_user.UpdateUserService
}

func NewUpdateUserHTTPHandler(
	config *config.Configuration,
	logger *slog.Logger,
	dbClient *mongo.Client,
	service svc_user.UpdateUserService,
) UpdateUserHTTPHandler {
	return &updateUserHTTPHandlerImpl{
		config:   config,
		logger:   logger,
		dbClient: dbClient,
		service:  service,
	}
}

func (h *updateUserHTTPHandlerImpl) Handle(w http.ResponseWriter, r *http.Request, idStr string) {
	// Set response content type
	w.Header().Set("Content-Type", "application/json")

	ctx := r.Context()

	// Parse the request body
	var requestData svc_user.UpdateUserRequestDTO
	defer r.Body.Close()

	var rawJSON bytes.Buffer
	teeReader := io.TeeReader(r.Body, &rawJSON) // TeeReader allows you to read the JSON and capture it

	// Read the JSON string and convert it into our golang struct
	err := json.NewDecoder(teeReader).Decode(&requestData)
	if err != nil {
		h.logger.Error("decoding error",
			slog.Any("err", err),
			slog.String("json", rawJSON.String()),
		)
		httperror.ResponseError(w, httperror.NewForSingleField(http.StatusBadRequest, "non_field_error", "payload structure is wrong"))
		return
	}

	// Convert string ID to ObjectID
	id, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		h.logger.Error("invalid ID format",
			slog.Any("error", err))
		httperror.ResponseError(w, httperror.NewForSingleField(http.StatusBadRequest, "id", "Invalid ID format"))
		return
	}

	// Start a MongoDB session for transaction
	session, err := h.dbClient.StartSession()
	if err != nil {
		h.logger.Error("start session error",
			slog.Any("error", err))
		httperror.ResponseError(w, err)
		return
	}
	defer session.EndSession(ctx)

	// Define the transaction
	transactionFunc := func(sessCtx mongo.SessionContext) (interface{}, error) {
		// Call service to update user
		response, err := h.service.Execute(sessCtx, id, &requestData)
		if err != nil {
			h.logger.Error("failed to update user",
				slog.Any("error", err))
			return nil, err
		}
		return response, nil
	}

	// Execute the transaction
	result, txErr := session.WithTransaction(ctx, transactionFunc)
	if txErr != nil {
		h.logger.Error("session failed error",
			slog.Any("error", txErr))
		httperror.ResponseError(w, txErr)
		return
	}

	// Encode and return the response
	resp := result.(*svc_user.UserResponseDTO)
	if err := json.NewEncoder(w).Encode(resp); err != nil {
		h.logger.Error("failed to encode response",
			slog.Any("error", err))
		httperror.ResponseError(w, err)
		return
	}
}
