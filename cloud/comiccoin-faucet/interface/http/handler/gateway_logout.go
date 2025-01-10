package handler

import (
	"log/slog"
	"net/http"
	_ "time/tzdata"

	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/httperror"
	sv_gateway "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/service/gateway"
)

type GatewayLogoutHTTPHandler struct {
	logger   *slog.Logger
	dbClient *mongo.Client
	service  sv_gateway.GatewayLogoutService
}

func NewGatewayLogoutHTTPHandler(
	logger *slog.Logger,
	dbClient *mongo.Client,
	service sv_gateway.GatewayLogoutService,
) *GatewayLogoutHTTPHandler {
	return &GatewayLogoutHTTPHandler{
		logger:   logger,
		dbClient: dbClient,
		service:  service,
	}
}

func (h *GatewayLogoutHTTPHandler) Execute(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	if err := h.service.Execute(ctx); err != nil {
		httperror.ResponseError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)

}
