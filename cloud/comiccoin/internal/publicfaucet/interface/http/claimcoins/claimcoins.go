// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/interface/http/hello/hello.go
package claimcoins

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	svc_claimcoins "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/service/claimcoins"
)

type PostClaimCoinsHTTPHandler struct {
	config   *config.Configuration
	logger   *slog.Logger
	dbClient *mongo.Client
	service  svc_claimcoins.ClaimCoinsService
}

func NewPostClaimCoinsHTTPHandler(
	config *config.Configuration,
	logger *slog.Logger,
	dbClient *mongo.Client,
	service svc_claimcoins.ClaimCoinsService,
) *PostClaimCoinsHTTPHandler {
	return &PostClaimCoinsHTTPHandler{
		config:   config,
		logger:   logger,
		dbClient: dbClient,
		service:  service,
	}
}

func (h *PostClaimCoinsHTTPHandler) Execute(w http.ResponseWriter, r *http.Request) {
	h.logger.Debug("starting...")

	// Set response content type
	w.Header().Set("Content-Type", "application/json")

	ctx := r.Context()

	// Get authenticated federatedidentity ID from context. This is loaded in
	// by the `AuthMiddleware` found via:
	// - github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/interface/http/middleware/auth.go
	federatedidentityID, ok := ctx.Value("federatedidentity_id").(primitive.ObjectID)
	if !ok {
		h.logger.Error("Failed getting local federatedidentity id",
			slog.Any("error", "Not found in context: federatedidentity_id"))
		httperror.ResponseError(w, errors.New("federatedidentity not found in context"))
		return
	}

	////
	//// Start the transaction.
	////

	session, err := h.dbClient.StartSession()
	if err != nil {
		h.logger.Error("start session error",
			slog.Any("error", err))
		httperror.ResponseError(w, err)
		return
	}
	defer session.EndSession(ctx)

	// Define a transaction function with a series of operations
	transactionFunc := func(sessCtx mongo.SessionContext) (interface{}, error) {
		// Call service
		response, err := h.service.Execute(sessCtx, federatedidentityID)
		if err != nil {
			h.logger.Error("failed to claim coins",
				slog.Any("error", err))
			return nil, err
		}
		return response, nil
	}

	// Start a transaction
	result, txErr := session.WithTransaction(ctx, transactionFunc)
	if txErr != nil {
		h.logger.Error("session failed error",
			slog.Any("error", txErr))
		httperror.ResponseError(w, txErr)
		return
	}

	// Encode response
	resp := result.(*svc_claimcoins.ClaimCoinsResponse)
	if err := json.NewEncoder(w).Encode(resp); err != nil {
		h.logger.Error("failed to encode response",
			slog.Any("error", err))
		httperror.ResponseError(w, err)
		return
	}

}
