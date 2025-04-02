// cloud/comiccoin/internal/iam/interface/http/publicwallet/deletebyid.go
package publicwallet

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	svc "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/service/publicwallet"
)

type DeletePublicWalletByIDHTTPHandler interface {
	Handle(w http.ResponseWriter, r *http.Request, idStr string)
}

type deletePublicWalletByIDHTTPHandlerImpl struct {
	config  *config.Configuration
	logger  *slog.Logger
	db      *mongo.Client
	service svc.DeletePublicWalletByIDService
}

func NewDeletePublicWalletByIDHTTPHandler(
	config *config.Configuration,
	logger *slog.Logger,
	db *mongo.Client,
	service svc.DeletePublicWalletByIDService,
) DeletePublicWalletByIDHTTPHandler {
	return &deletePublicWalletByIDHTTPHandlerImpl{
		config:  config,
		logger:  logger,
		db:      db,
		service: service,
	}
}

func (h *deletePublicWalletByIDHTTPHandlerImpl) Handle(w http.ResponseWriter, r *http.Request, idStr string) {
	ctx := r.Context()

	// Convert ID to ObjectID
	id, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	// Execute service
	err = h.service.DeleteByID(ctx, id)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	// Return success response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
	})
}
