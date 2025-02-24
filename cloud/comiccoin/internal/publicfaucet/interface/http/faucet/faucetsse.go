// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/interface/http/faucet/getbychainidsse.go
package faucet

import (
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"strconv"
	"time"

	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config/constants"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	svc_faucet "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/service/faucet"
)

type FaucetServerSentEventsHTTPHandler struct {
	logger   *slog.Logger
	dbClient *mongo.Client
	service  svc_faucet.GetFaucetService
}

func NewFaucetServerSentEventsHTTPHandler(
	logger *slog.Logger,
	dbClient *mongo.Client,
	s svc_faucet.GetFaucetService,
) *FaucetServerSentEventsHTTPHandler {
	return &FaucetServerSentEventsHTTPHandler{logger, dbClient, s}
}

func (h *FaucetServerSentEventsHTTPHandler) Execute(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	ipAddress, _ := ctx.Value(constants.SessionIPAddress).(string)

	// Set CORS headers to allow all origins. You may want to restrict this to specific origins in a production environment.
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Expose-Headers", "Content-Type")

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("X-Accel-Buffering", "no")

	chainIDStr := r.URL.Query().Get("chain_id")
	if chainIDStr == "" || (chainIDStr != "1" && chainIDStr != "2") {
		http.Error(w, "Invalid chain_id parameter", http.StatusBadRequest)
		return
	}
	var chainID uint16

	if len(chainIDStr) > 0 {
		var err error
		chainIDInt64, err := strconv.ParseUint(chainIDStr, 10, 16)
		if err != nil {
			log.Println(err)
		}
		chainID = uint16(chainIDInt64)
	}

	h.logger.Debug("Client connected with faucet SSE stream",
		slog.Any("chain_id", chainID),
		slog.Any("ip_address", ipAddress))

	// Create a channel for client disconnection
	clientGone := r.Context().Done()

	// Create ticker that will send a SSE to the client every ten seconds.
	t := time.NewTicker(10 * time.Second)
	defer t.Stop()
	for {
		select {
		case <-clientGone:
			h.logger.Debug("Client disconnected",
				slog.Any("chain_id", chainID),
				slog.Any("ip_address", ipAddress))
			return
		case <-t.C:

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
				faucet, err := h.service.ExecuteByChainID(sessCtx, chainID)
				if err != nil {
					h.logger.Error("failed executing",
						slog.Any("error", err))
					return nil, err
				}
				return faucet, nil
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
			faucet := result.(*svc_faucet.FaucetDTO)

			if faucet != nil {
				var sssData string

				sssData = fmt.Sprintf("%v|%v|%v|%v|%v|%v|%v|%v",
					faucet.Balance,
					faucet.UsersCount,
					faucet.TotalCoinsDistributed,
					faucet.TotalTransactions,
					faucet.DistributationRatePerDay,
					faucet.TotalCoinsDistributedToday,
					faucet.TotalTransactionsToday,
					faucet.LastModifiedAt,
				)

				// For debugging purposes only. (Uncommenting will make for noisy console logs)
				h.logger.Debug("Sending sse to client...",
					slog.Any("data", sssData),
					slog.Any("chain_id", chainID),
					slog.Any("ip_address", ipAddress))

				// Send an event to the client.
				fmt.Fprintf(w, "data: %v\n\n", sssData)
			} else {
				// For debugging purposes only. (Uncommenting will make for noisy console logs)
				h.logger.Warn("Sending empty sse to client...",
					slog.Any("chain_id", chainID),
					slog.Any("ip_address", ipAddress))
				fmt.Fprintf(w, "data: \n\n")
			}

			w.(http.Flusher).Flush()
			time.Sleep(1 * time.Second)
		}
	}
}
