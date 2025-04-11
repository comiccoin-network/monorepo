// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/interface/http/user/get.go
package user

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	svc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/service/user"
)

type GetUserHTTPHandler interface {
	Handle(w http.ResponseWriter, r *http.Request, idOrEmail string)
}

type getUserHTTPHandlerImpl struct {
	config   *config.Configuration
	logger   *slog.Logger
	dbClient *mongo.Client
	service  svc_user.GetUserService
}

func NewGetUserHTTPHandler(
	config *config.Configuration,
	logger *slog.Logger,
	dbClient *mongo.Client,
	service svc_user.GetUserService,
) GetUserHTTPHandler {
	return &getUserHTTPHandlerImpl{
		config:   config,
		logger:   logger,
		dbClient: dbClient,
		service:  service,
	}
}

func (h *getUserHTTPHandlerImpl) Handle(w http.ResponseWriter, r *http.Request, idStr string) {
	// Set response content type
	w.Header().Set("Content-Type", "application/json")

	ctx := r.Context()

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
		var response *svc_user.UserResponseDTO
		var err error

		// Check if the parameter is an ObjectID or email
		id, convertErr := primitive.ObjectIDFromHex(idStr)
		if convertErr != nil {
			h.logger.Error("invalid ID format",
				slog.Any("error", convertErr))
			return nil, httperror.NewForSingleField(http.StatusBadRequest, "id", "Invalid ID format")
		}
		response, err = h.service.ExecuteByID(sessCtx, id)

		if err != nil {
			h.logger.Error("failed to get user",
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
