// cloud/comiccoin/internal/iam/interface/http/publicwallet/listbyfilter.go
package publicwallet

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"strconv"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/publicwallet"
	svc "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/service/publicwallet"
)

type ListPublicWalletsByFilterHTTPHandler interface {
	Handle(w http.ResponseWriter, r *http.Request)
}

type listPublicWalletsByFilterHTTPHandlerImpl struct {
	config  *config.Configuration
	logger  *slog.Logger
	db      *mongo.Client
	service svc.ListPublicWalletsByFilterService
}

func NewListPublicWalletsByFilterHTTPHandler(
	config *config.Configuration,
	logger *slog.Logger,
	db *mongo.Client,
	service svc.ListPublicWalletsByFilterService,
) ListPublicWalletsByFilterHTTPHandler {
	return &listPublicWalletsByFilterHTTPHandlerImpl{
		config:  config,
		logger:  logger,
		db:      db,
		service: service,
	}
}

func (h *listPublicWalletsByFilterHTTPHandlerImpl) Handle(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Build filter from query parameters
	filter := &dom.PublicWalletFilter{}

	// Parse userID if provided
	createdByUserIDStr := r.URL.Query().Get("created_by_user_id")
	if createdByUserIDStr != "" {
		createdByUserID, err := primitive.ObjectIDFromHex(createdByUserIDStr)
		if err != nil {
			httperror.ResponseError(w, err)
			return
		}
		filter.CreatedByUserID = createdByUserID
	}

	// Parse created_at_start if provided
	createdAtStartStr := r.URL.Query().Get("created_at_start")
	if createdAtStartStr != "" {
		createdAtStart, err := time.Parse(time.RFC3339, createdAtStartStr)
		if err != nil {
			httperror.ResponseError(w, err)
			return
		}
		filter.CreatedAtStart = &createdAtStart
	}

	// Parse created_at_end if provided
	createdAtEndStr := r.URL.Query().Get("created_at_end")
	if createdAtEndStr != "" {
		createdAtEnd, err := time.Parse(time.RFC3339, createdAtEndStr)
		if err != nil {
			httperror.ResponseError(w, err)
			return
		}
		filter.CreatedAtEnd = &createdAtEnd
	}

	// Parse search value if provided
	value := r.URL.Query().Get("value")
	if value != "" {
		filter.Value = &value
	}

	// Parse cursor pagination parameters
	lastIDStr := r.URL.Query().Get("last_id")
	if lastIDStr != "" {
		lastID, err := primitive.ObjectIDFromHex(lastIDStr)
		if err != nil {
			httperror.ResponseError(w, err)
			return
		}
		filter.LastID = &lastID
	}

	lastCreatedAtStr := r.URL.Query().Get("last_created_at")
	if lastCreatedAtStr != "" {
		lastCreatedAt, err := time.Parse(time.RFC3339, lastCreatedAtStr)
		if err != nil {
			httperror.ResponseError(w, err)
			return
		}
		filter.LastCreatedAt = &lastCreatedAt
	}

	// Parse limit
	limitStr := r.URL.Query().Get("limit")
	if limitStr != "" {
		limit, err := strconv.ParseInt(limitStr, 10, 64)
		if err != nil {
			httperror.ResponseError(w, err)
			return
		}
		filter.Limit = limit
	} else {
		filter.Limit = 100 // Default limit
	}

	// Execute service
	result, err := h.service.ListByFilter(ctx, filter)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	// Return success response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(result)
}
