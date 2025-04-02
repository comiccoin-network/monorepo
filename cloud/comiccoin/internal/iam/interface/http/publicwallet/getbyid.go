// cloud/comiccoin/internal/iam/interface/http/publicwallet/getbyid.go
package publicwallet

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	svc "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/service/publicwallet"
)

type GetPublicWalletByIDHTTPHandler interface {
	Handle(w http.ResponseWriter, r *http.Request, idStr string)
}

type getPublicWalletByIDHTTPHandlerImpl struct {
	config  *config.Configuration
	logger  *slog.Logger
	db      *mongo.Client
	service svc.GetPublicWalletByIDService
}

func NewGetPublicWalletByIDHTTPHandler(
	config *config.Configuration,
	logger *slog.Logger,
	db *mongo.Client,
	service svc.GetPublicWalletByIDService,
) GetPublicWalletByIDHTTPHandler {
	return &getPublicWalletByIDHTTPHandlerImpl{
		config:  config,
		logger:  logger,
		db:      db,
		service: service,
	}
}

func (h *getPublicWalletByIDHTTPHandlerImpl) Handle(w http.ResponseWriter, r *http.Request, idStr string) {
	ctx := r.Context()

	// Convert ID to ObjectID
	id, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	// Execute service
	publicWallet, err := h.service.GetByID(ctx, id)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	// Check if public wallet exists
	if publicWallet == nil {
		httperror.ResponseError(w, errors.New("public wallet not found"))
		return
	}

	// Return success response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"public_wallet": publicWallet,
	})
}
