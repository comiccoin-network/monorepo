// cloud/comiccoin/internal/iam/interface/http/publicwallet/getbyaddress.go
package publicwallet

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"

	"github.com/ethereum/go-ethereum/common"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	svc "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/service/publicwallet"
)

type GetPublicWalletByAddressHTTPHandler interface {
	Handle(w http.ResponseWriter, r *http.Request, addressStr string)
}

type getPublicWalletByAddressHTTPHandlerImpl struct {
	config  *config.Configuration
	logger  *slog.Logger
	db      *mongo.Client
	service svc.GetPublicWalletByAddressService
}

func NewGetPublicWalletByAddressHTTPHandler(
	config *config.Configuration,
	logger *slog.Logger,
	db *mongo.Client,
	service svc.GetPublicWalletByAddressService,
) GetPublicWalletByAddressHTTPHandler {
	return &getPublicWalletByAddressHTTPHandlerImpl{
		config:  config,
		logger:  logger,
		db:      db,
		service: service,
	}
}

func (h *getPublicWalletByAddressHTTPHandlerImpl) Handle(w http.ResponseWriter, r *http.Request, addressStr string) {
	ctx := r.Context()

	// Convert address string to address
	address := common.HexToAddress(addressStr)

	// Execute service
	publicWallet, err := h.service.GetByAddress(ctx, &address)
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
