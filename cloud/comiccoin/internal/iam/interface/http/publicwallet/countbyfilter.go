// cloud/comiccoin/internal/iam/interface/http/publicwallet/countbyfilter.go
package publicwallet

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/publicwallet"
	svc "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/service/publicwallet"
)

type CountPublicWalletsByFilterHTTPHandler interface {
	Handle(w http.ResponseWriter, r *http.Request)
}

type countPublicWalletsByFilterHTTPHandlerImpl struct {
	config  *config.Configuration
	logger  *slog.Logger
	db      *mongo.Client
	service svc.CountPublicWalletsByFilterService
}

func NewCountPublicWalletsByFilterHTTPHandler(
	config *config.Configuration,
	logger *slog.Logger,
	db *mongo.Client,
	service svc.CountPublicWalletsByFilterService,
) CountPublicWalletsByFilterHTTPHandler {
	return &countPublicWalletsByFilterHTTPHandlerImpl{
		config:  config,
		logger:  logger,
		db:      db,
		service: service,
	}
}

func (h *countPublicWalletsByFilterHTTPHandlerImpl) Handle(w http.ResponseWriter, r *http.Request) {
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

	// Execute service
	count, err := h.service.CountByFilter(ctx, filter)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	// Return success response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"count": count,
	})
}
