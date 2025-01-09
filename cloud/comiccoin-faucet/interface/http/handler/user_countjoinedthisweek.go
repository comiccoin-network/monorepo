package handler

import (
	"encoding/json"
	"log/slog"
	"net/http"
	_ "time/tzdata"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/config/constants"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/domain"
	sv_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/service/user"
)

type UserCountJoinedThisWeekHTTPHandler struct {
	logger   *slog.Logger
	dbClient *mongo.Client
	service  *sv_user.UserCountJoinedThisWeekService
}

func NewUserCountJoinedThisWeekHTTPHandler(
	logger *slog.Logger,
	dbClient *mongo.Client,
	service *sv_user.UserCountJoinedThisWeekService,
) *UserCountJoinedThisWeekHTTPHandler {
	return &UserCountJoinedThisWeekHTTPHandler{
		logger:   logger,
		dbClient: dbClient,
		service:  service,
	}
}

func (h *UserCountJoinedThisWeekHTTPHandler) Execute(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	tenantID, _ := ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID)
	loggedInUserTimezone, _ := ctx.Value(constants.SessionUserTimezone).(string)
	loggedInUserRole, _ := ctx.Value(constants.SessionUserRole).(int8)

	// Defensive Code: Only admins can call this API endpoint.
	if loggedInUserRole != domain.UserRoleRoot {
		h.logger.Error("Attempting to access an administrative protected endpoin")
		http.Error(w, "Attempting to access an administrative protected endpoint", http.StatusForbidden)
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
		resp, err := h.service.Execute(sessCtx, tenantID, loggedInUserTimezone)
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

	resp := result.(*sv_user.UserCountJoinedThisWeekResponseIDO)

	if err := json.NewEncoder(w).Encode(&resp); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

}
