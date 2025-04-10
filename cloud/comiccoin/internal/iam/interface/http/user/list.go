// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/interface/http/user/list.go
package user

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"strconv"

	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	svc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/service/user"
)

type ListUsersHTTPHandler interface {
	Handle(w http.ResponseWriter, r *http.Request)
}

type listUsersHTTPHandlerImpl struct {
	config   *config.Configuration
	logger   *slog.Logger
	dbClient *mongo.Client
	service  svc_user.ListUsersService
}

func NewListUsersHTTPHandler(
	config *config.Configuration,
	logger *slog.Logger,
	dbClient *mongo.Client,
	service svc_user.ListUsersService,
) ListUsersHTTPHandler {
	return &listUsersHTTPHandlerImpl{
		config:   config,
		logger:   logger,
		dbClient: dbClient,
		service:  service,
	}
}

func (h *listUsersHTTPHandlerImpl) Handle(w http.ResponseWriter, r *http.Request) {
	// Set response content type
	w.Header().Set("Content-Type", "application/json")

	ctx := r.Context()

	// Parse query parameters
	page, err := strconv.Atoi(r.URL.Query().Get("page"))
	if err != nil || page < 1 {
		page = 1 // Default to page 1 if invalid
	}

	pageSize, err := strconv.Atoi(r.URL.Query().Get("page_size"))
	if err != nil || pageSize < 1 {
		pageSize = 20 // Default page size
	}

	// Validate and cap page size to prevent excessive data loads
	if pageSize > 100 {
		pageSize = 100
	}

	searchTerm := r.URL.Query().Get("search")

	// Parse role if provided
	var role int8
	roleStr := r.URL.Query().Get("role")
	if roleStr != "" {
		roleInt, err := strconv.ParseInt(roleStr, 10, 8)
		if err == nil {
			role = int8(roleInt)
		} else {
			h.logger.Warn("Invalid role parameter",
				slog.String("value", roleStr),
				slog.Any("error", err))
		}
	}

	// Parse status if provided
	var status int8
	statusStr := r.URL.Query().Get("status")
	if statusStr != "" {
		statusInt, err := strconv.ParseInt(statusStr, 10, 8)
		if err == nil {
			status = int8(statusInt)
		} else {
			h.logger.Warn("Invalid status parameter",
				slog.String("value", statusStr),
				slog.Any("error", err))
		}
	}

	// Parse profile verification status if provided
	var profileVerificationStatus int8
	profileVerificationStatusStr := r.URL.Query().Get("profile_verification_status")
	if profileVerificationStatusStr != "" {
		profileVerificationStatusInt, err := strconv.ParseInt(profileVerificationStatusStr, 10, 8)
		if err == nil {
			profileVerificationStatus = int8(profileVerificationStatusInt)
		} else {
			h.logger.Warn("Invalid profile verification status parameter",
				slog.String("value", profileVerificationStatusStr),
				slog.Any("error", err))
		}
	}

	// Get sort parameters
	sortBy := r.URL.Query().Get("sort_by")
	sortOrder := r.URL.Query().Get("sort_order")

	// Prepare request for service
	request := &svc_user.ListUsersRequestDTO{
		Page:                      page,
		PageSize:                  pageSize,
		SearchTerm:                searchTerm,
		Role:                      role,
		Status:                    status,
		ProfileVerificationStatus: profileVerificationStatus,
		SortBy:                    sortBy,
		SortOrder:                 sortOrder,
	}

	// Start a MongoDB session for transaction
	session, err := h.dbClient.StartSession()
	if err != nil {
		h.logger.Error("start session error",
			slog.Any("error", err))
		httperror.ResponseError(w, err)
		return
	}
	defer session.EndSession(ctx)

	// Define the transaction
	transactionFunc := func(sessCtx mongo.SessionContext) (interface{}, error) {
		// Call service to list users
		response, err := h.service.Execute(sessCtx, request)
		if err != nil {
			h.logger.Error("failed to list users",
				slog.Any("error", err))
			return nil, err
		}
		return response, nil
	}

	// Execute the transaction
	result, txErr := session.WithTransaction(ctx, transactionFunc)
	if txErr != nil {
		h.logger.Error("session failed error",
			slog.Any("error", txErr))
		httperror.ResponseError(w, txErr)
		return
	}

	// Encode and return the response
	resp := result.(*svc_user.ListUsersResponseDTO)
	if err := json.NewEncoder(w).Encode(resp); err != nil {
		h.logger.Error("failed to encode response",
			slog.Any("error", err))
		httperror.ResponseError(w, err)
		return
	}
}
