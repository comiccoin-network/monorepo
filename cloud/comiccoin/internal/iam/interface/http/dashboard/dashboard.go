// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/interface/http/dashboard/dashboard.go
package dashboard

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	svc_dashboard "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/service/dashboard"
)

type DashboardHTTPHandler interface {
	Handle(w http.ResponseWriter, r *http.Request)
}

type dashboardHTTPHandlerImpl struct {
	config   *config.Configuration
	logger   *slog.Logger
	dbClient *mongo.Client
	service  svc_dashboard.GetDashboardService
}

func NewDashboardHTTPHandler(
	config *config.Configuration,
	logger *slog.Logger,
	dbClient *mongo.Client,
	service svc_dashboard.GetDashboardService,
) DashboardHTTPHandler {
	return &dashboardHTTPHandlerImpl{
		config:   config,
		logger:   logger,
		dbClient: dbClient,
		service:  service,
	}
}

func (h *dashboardHTTPHandlerImpl) Handle(w http.ResponseWriter, r *http.Request) {
	// Set response content type
	w.Header().Set("Content-Type", "application/json")

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

		// Call service
		response, err := h.service.Execute(sessCtx)
		if err != nil {
			h.logger.Error("failed to get iam by chain id",
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
	resp := result.(*svc_dashboard.DashboardDTO)
	if err := json.NewEncoder(w).Encode(resp); err != nil {
		h.logger.Error("failed to encode response",
			slog.Any("error", err))
		httperror.ResponseError(w, err)
		return
	}

}
