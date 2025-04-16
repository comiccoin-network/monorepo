// cloud/comiccoin/internal/iam/interface/http/publicwalletdirectory/getbyaddress.go
package publicwalletdirectory

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"

	"github.com/ethereum/go-ethereum/common"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/publicwallet"
	svc "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/service/publicwalletdirectory"
)

type GetPublicWalletsFromDirectoryByAddressHTTPHandler interface {
	Handle(w http.ResponseWriter, r *http.Request, addressStr string)
}

type getPublicWalletsFromDirectoryByAddressHTTPHandlerImpl struct {
	config   *config.Configuration
	logger   *slog.Logger
	dbClient *mongo.Client
	service  svc.GetPublicWalletsFromDirectoryByAddressService
}

func NewGetPublicWalletsFromDirectoryByAddressHTTPHandler(
	config *config.Configuration,
	logger *slog.Logger,
	dbClient *mongo.Client,
	service svc.GetPublicWalletsFromDirectoryByAddressService,
) GetPublicWalletsFromDirectoryByAddressHTTPHandler {
	return &getPublicWalletsFromDirectoryByAddressHTTPHandlerImpl{
		config:   config,
		logger:   logger,
		dbClient: dbClient,
		service:  service,
	}
}

func (h *getPublicWalletsFromDirectoryByAddressHTTPHandlerImpl) Handle(w http.ResponseWriter, r *http.Request, addressStr string) {
	ctx := r.Context()

	// Convert address string to address
	address := common.HexToAddress(addressStr)

	// Start database transaction
	session, err := h.dbClient.StartSession()
	if err != nil {
		h.logger.Error("start session error", slog.Any("error", err))
		httperror.ResponseError(w, err)
		return
	}
	defer session.EndSession(ctx)

	// Execute transaction
	txFunc := func(sessCtx mongo.SessionContext) (interface{}, error) {
		// Execute service
		publicWallet, err := h.service.GetByAddress(sessCtx, &address)
		if err != nil {
			h.logger.Error("failed to create public wallet",
				slog.Any("error", err))
			return nil, err
		}
		return publicWallet, nil
	}

	// Return response
	txResult, txErr := session.WithTransaction(ctx, txFunc)
	if txErr != nil {
		h.logger.Error("transaction failed", slog.Any("error", txErr))
		httperror.ResponseError(w, txErr)
		return
	}

	// Return response
	publicWallet := txResult.(*dom.PublicWallet)

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
