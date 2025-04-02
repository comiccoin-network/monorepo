// cloud/comiccoin/internal/iam/interface/http/publicwallet/updatebyid.go
package publicwallet

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/publicwallet"
	svc "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/service/publicwallet"
)

type UpdatePublicWalletByIDHTTPHandler interface {
	Handle(w http.ResponseWriter, r *http.Request, idStr string)
}

type updatePublicWalletByIDHTTPHandlerImpl struct {
	config  *config.Configuration
	logger  *slog.Logger
	db      *mongo.Client
	service svc.UpdatePublicWalletByIDService
}

func NewUpdatePublicWalletByIDHTTPHandler(
	config *config.Configuration,
	logger *slog.Logger,
	db *mongo.Client,
	service svc.UpdatePublicWalletByIDService,
) UpdatePublicWalletByIDHTTPHandler {
	return &updatePublicWalletByIDHTTPHandlerImpl{
		config:  config,
		logger:  logger,
		db:      db,
		service: service,
	}
}

func (h *updatePublicWalletByIDHTTPHandlerImpl) Handle(w http.ResponseWriter, r *http.Request, idStr string) {
	ctx := r.Context()

	// Convert ID to ObjectID
	id, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	// Parse request
	var req dom.PublicWallet
	err = json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	// Set ID from URL
	req.ID = id

	// Execute service
	err = h.service.UpdateByID(ctx, &req)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	// Return success response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"public_wallet": req,
	})
}
