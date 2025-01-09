package handler

import (
	"encoding/json"
	"log/slog"
	"net/http"
	_ "time/tzdata"

	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/domain"
	sv_gateway "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/service/gateway"
)

type GatewayProfileDetailHTTPHandler struct {
	logger   *slog.Logger
	dbClient *mongo.Client
	service  *sv_gateway.GatewayProfileGetService
}

func NewGatewayProfileDetailHTTPHandler(
	logger *slog.Logger,
	dbClient *mongo.Client,
	service *sv_gateway.GatewayProfileGetService,
) *GatewayProfileDetailHTTPHandler {
	return &GatewayProfileDetailHTTPHandler{
		logger:   logger,
		dbClient: dbClient,
		service:  service,
	}
}

func (h *GatewayProfileDetailHTTPHandler) Execute(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

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
		resp, err := h.service.Execute(sessCtx)
		if err != nil {
			return nil, err
		}
		return resp, nil
	}

	// Start a transaction
	result, err := session.WithTransaction(ctx, transactionFunc)
	if err != nil {
		h.logger.Error("session failed error",
			slog.Any("error", err))
		httperror.ResponseError(w, err)
		return
	}

	resp := result.(*domain.User)

	if err := json.NewEncoder(w).Encode(&resp); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
