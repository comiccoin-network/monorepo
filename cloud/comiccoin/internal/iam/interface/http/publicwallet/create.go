// cloud/comiccoin/internal/iam/interface/http/publicwallet/create.go
package publicwallet

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/publicwallet"
	svc "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/service/publicwallet"
)

type CreatePublicWalletHTTPHandler interface {
	Handle(w http.ResponseWriter, r *http.Request)
}

type createPublicWalletHTTPHandlerImpl struct {
	config  *config.Configuration
	logger  *slog.Logger
	db      *mongo.Client
	service svc.CreatePublicWalletService
}

func NewCreatePublicWalletHTTPHandler(
	config *config.Configuration,
	logger *slog.Logger,
	db *mongo.Client,
	service svc.CreatePublicWalletService,
) CreatePublicWalletHTTPHandler {
	return &createPublicWalletHTTPHandlerImpl{
		config:  config,
		logger:  logger,
		db:      db,
		service: service,
	}
}

func (h *createPublicWalletHTTPHandlerImpl) Handle(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Parse request
	var req dom.PublicWallet
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	// Execute service
	err = h.service.Create(ctx, &req)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	// Return success response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"public_wallet": req,
	})
}
