package handler

import (
	"encoding/json"
	"log/slog"
	"net/http"
	_ "time/tzdata"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/httperror"
	sv_comicsubmission "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/service/comicsubmission"
)

type ComicSubmissionGetHTTPHandler struct {
	logger   *slog.Logger
	dbClient *mongo.Client
	service  sv_comicsubmission.ComicSubmissionGetService
}

func NewComicSubmissionGetHTTPHandler(
	logger *slog.Logger,
	dbClient *mongo.Client,
	service sv_comicsubmission.ComicSubmissionGetService,
) *ComicSubmissionGetHTTPHandler {
	return &ComicSubmissionGetHTTPHandler{
		logger:   logger,
		dbClient: dbClient,
		service:  service,
	}
}

func (h *ComicSubmissionGetHTTPHandler) Execute(w http.ResponseWriter, r *http.Request, idStr string) {
	ctx := r.Context()
	objectID, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		httperror.ResponseError(w, err)
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
		resp, err := h.service.Execute(sessCtx, objectID)
		if err != nil {
			// httperror.ResponseError(w, err)
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

	resp := result.(sv_comicsubmission.ComicSubmissionResponseIDO)

	if err := json.NewEncoder(w).Encode(&resp); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

}
