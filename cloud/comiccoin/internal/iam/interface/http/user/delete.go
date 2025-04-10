// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/interface/http/user/delete.go
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

type DeleteUserHTTPHandler interface {
	Handle(w http.ResponseWriter, r *http.Request, idStr string)
}

type deleteUserHTTPHandlerImpl struct {
	config   *config.Configuration
	logger   *slog.Logger
	dbClient *mongo.Client
	service  svc_user.DeleteUserService
}

func NewDeleteUserHTTPHandler(
	config *config.Configuration,
	logger *slog.Logger,
	dbClient *mongo.Client,
	service svc_user.DeleteUserService,
) DeleteUserHTTPHandler {
	return &deleteUserHTTPHandlerImpl{
		config:   config,
		logger:   logger,
		dbClient: dbClient,
		service:  service,
	}
}

func (h *deleteUserHTTPHandlerImpl) Handle(w http.ResponseWriter, r *http.Request, idStr string) {
	// Set response content type
	w.Header().Set("Content-Type", "application/json")

	ctx := r.Context()

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
		// Call service to delete user
		err := h.service.Execute(sessCtx, id)
		if err != nil {
			h.logger.Error("failed to delete user",
				slog.Any("error", err))
			return nil, err
		}
		return true, nil // Return success flag
	}

	// Execute the transaction
	_, txErr := session.WithTransaction(ctx, transactionFunc)
	if txErr != nil {
		h.logger.Error("session failed error",
			slog.Any("error", txErr))
		httperror.ResponseError(w, txErr)
		return
	}

	// Return success response
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "User deleted successfully",
	})
}
