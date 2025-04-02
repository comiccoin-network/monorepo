// cloud/comiccoin/internal/iam/interface/http/publicwallet/updatebyaddress.go
package publicwallet

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/ethereum/go-ethereum/common"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/publicwallet"
	svc "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/service/publicwallet"
)

type UpdatePublicWalletByAddressHTTPHandler interface {
	Handle(w http.ResponseWriter, r *http.Request, addressStr string)
}

type updatePublicWalletByAddressHTTPHandlerImpl struct {
	config  *config.Configuration
	logger  *slog.Logger
	db      *mongo.Client
	service svc.UpdatePublicWalletByAddressService
}

func NewUpdatePublicWalletByAddressHTTPHandler(
	config *config.Configuration,
	logger *slog.Logger,
	db *mongo.Client,
	service svc.UpdatePublicWalletByAddressService,
) UpdatePublicWalletByAddressHTTPHandler {
	return &updatePublicWalletByAddressHTTPHandlerImpl{
		config:  config,
		logger:  logger,
		db:      db,
		service: service,
	}
}

func (h *updatePublicWalletByAddressHTTPHandlerImpl) Handle(w http.ResponseWriter, r *http.Request, addressStr string) {
	ctx := r.Context()

	// Convert address string to address
	address := common.HexToAddress(addressStr)

	// Parse request
	var req dom.PublicWallet
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	// Set address from URL
	req.Address = &address

	// Execute service
	err = h.service.UpdateByAddress(ctx, &req)
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
