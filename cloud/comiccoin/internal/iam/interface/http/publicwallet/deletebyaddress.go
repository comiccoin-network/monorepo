// cloud/comiccoin/internal/iam/interface/http/publicwallet/deletebyid.go
package publicwallet

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/ethereum/go-ethereum/common"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	svc "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/service/publicwallet"
)

type DeletePublicWalletByAddressHTTPHandler interface {
	Handle(w http.ResponseWriter, r *http.Request, addressStr string)
}

type deletePublicWalletByAddressHTTPHandlerImpl struct {
	config  *config.Configuration
	logger  *slog.Logger
	db      *mongo.Client
	service svc.DeletePublicWalletByAddressService
}

func NewDeletePublicWalletByAddressHTTPHandler(
	config *config.Configuration,
	logger *slog.Logger,
	db *mongo.Client,
	service svc.DeletePublicWalletByAddressService,
) DeletePublicWalletByAddressHTTPHandler {
	return &deletePublicWalletByAddressHTTPHandlerImpl{
		config:  config,
		logger:  logger,
		db:      db,
		service: service,
	}
}

func (h *deletePublicWalletByAddressHTTPHandlerImpl) Handle(w http.ResponseWriter, r *http.Request, addressStr string) {
	ctx := r.Context()

	// Convert address string to address
	address := common.HexToAddress(addressStr)

	// Execute service
	err := h.service.DeleteByAddress(ctx, &address)
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
