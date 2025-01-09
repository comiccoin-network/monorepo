package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	_ "time/tzdata"

	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/config/constants"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/domain"
	sv_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/service/user"
)

type UserProfileVerificationJudgeOperationHTTPHandler struct {
	logger   *slog.Logger
	dbClient *mongo.Client
	service  *sv_user.UserProfileVerificationJudgeOperationService
}

func NewUserProfileVerificationJudgeOperationHTTPHandler(
	logger *slog.Logger,
	dbClient *mongo.Client,
	service *sv_user.UserProfileVerificationJudgeOperationService,
) *UserProfileVerificationJudgeOperationHTTPHandler {
	return &UserProfileVerificationJudgeOperationHTTPHandler{
		logger:   logger,
		dbClient: dbClient,
		service:  service,
	}
}

func (h *UserProfileVerificationJudgeOperationHTTPHandler) unmarshalProfileUpdateRequest(
	ctx context.Context,
	r *http.Request,
) (*sv_user.UserProfileVerificationJudgeOperationRequestIDO, error) {
	// Initialize our array which will store all the results from the remote server.
	var requestData sv_user.UserProfileVerificationJudgeOperationRequestIDO

	defer r.Body.Close()

	var rawJSON bytes.Buffer
	teeReader := io.TeeReader(r.Body, &rawJSON) // TeeReader allows you to read the JSON and capture it

	// Read the JSON string and convert it into our Golang structure else we
	// need to send a `400 Bad Request` error message back to the client.
	err := json.NewDecoder(teeReader).Decode(&requestData) // [1]
	if err != nil {
		h.logger.Error("decoding error",
			slog.Any("err", err),
			slog.String("json", rawJSON.String()),
		)
		return nil, httperror.NewForSingleField(http.StatusBadRequest, "non_field_error", "payload structure is wrong")
	}

	return &requestData, nil
}

func (h *UserProfileVerificationJudgeOperationHTTPHandler) Execute(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	loggedInUserRole, _ := ctx.Value(constants.SessionUserRole).(int8)

	// Defensive Code: Only admins can call this API endpoint.
	if loggedInUserRole != domain.UserRoleRoot {
		h.logger.Error("Attempting to access an administrative protected endpoin")
		http.Error(w, "Attempting to access an administrative protected endpoint", http.StatusForbidden)
		return
	}

	data, err := h.unmarshalProfileUpdateRequest(ctx, r)
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
		resp, err := h.service.Execute(sessCtx, data)
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

	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(&resp); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
