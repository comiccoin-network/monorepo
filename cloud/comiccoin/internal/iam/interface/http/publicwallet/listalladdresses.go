// cloud/comiccoin/internal/iam/interface/http/publicwallet/listalladdresses.go
package publicwallet

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	svc "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/service/publicwallet"
)

type ListAllPublicWalletAddressesHTTPHandler interface {
	Handle(w http.ResponseWriter, r *http.Request)
}

type listAllPublicWalletAddressesHTTPHandlerImpl struct {
	config  *config.Configuration
	logger  *slog.Logger
	db      *mongo.Client
	service svc.ListAllPublicWalletAddressesService
}

func NewListAllPublicWalletAddressesHTTPHandler(
	config *config.Configuration,
	logger *slog.Logger,
	db *mongo.Client,
	service svc.ListAllPublicWalletAddressesService,
) ListAllPublicWalletAddressesHTTPHandler {
	return &listAllPublicWalletAddressesHTTPHandlerImpl{
		config:  config,
		logger:  logger,
		db:      db,
		service: service,
	}
}

func (h *listAllPublicWalletAddressesHTTPHandlerImpl) Handle(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Execute service
	addresses, err := h.service.ListAllAddresses(ctx)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	// Convert addresses to strings for JSON
	addressStrings := make([]string, len(addresses))
	for i, addr := range addresses {
		addressStrings[i] = addr.Hex()
	}

	// Return success response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"addresses": addressStrings,
	})
}
