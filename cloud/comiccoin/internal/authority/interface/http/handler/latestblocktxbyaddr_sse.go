package handler

import (
	"fmt"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config/constants"
	sv_blocktx "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/service/blocktx"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/ethereum/go-ethereum/common"
)

// GetLatestBlockTransactionByAddressServerSentEventsHTTPHandler is responsible for
// sending to the client the latest transaction information pertaining to the
// account address selected.
type GetLatestBlockTransactionByAddressServerSentEventsHTTPHandler struct {
	logger  *slog.Logger
	service sv_blocktx.GetLatestBlockTransactionByAddressService
}

func NewGetLatestBlockTransactionByAddressServerSentEventsHTTPHandler(
	logger *slog.Logger,
	s sv_blocktx.GetLatestBlockTransactionByAddressService,
) *GetLatestBlockTransactionByAddressServerSentEventsHTTPHandler {
	return &GetLatestBlockTransactionByAddressServerSentEventsHTTPHandler{logger, s}
}

func (h *GetLatestBlockTransactionByAddressServerSentEventsHTTPHandler) Execute(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	ipAddress, _ := ctx.Value(constants.SessionIPAddress).(string)

	// Set CORS headers to allow all origins. You may want to restrict this to specific origins in a production environment.
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Expose-Headers", "Content-Type")

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("X-Accel-Buffering", "no")

	addressStr := r.URL.Query().Get("address")
	addr := common.HexToAddress(strings.ToLower(addressStr))

	h.logger.Debug("Client connected with SSE stream",
		slog.Any("ip_address", ipAddress),
		slog.Any("addr", addr))

	// Create a channel for client disconnection
	clientGone := r.Context().Done()

	// Create ticker that will send a SSE to the client every ten seconds.
	t := time.NewTicker(10 * time.Second)
	defer t.Stop()
	for {
		select {
		case <-clientGone:
			h.logger.Debug("Client disconnected",
				slog.Any("ip_address", ipAddress))
			return
		case <-t.C:

			blocktx, err := h.service.Execute(ctx, &addr)
			if err != nil {
				httperror.ResponseError(w, err)
				return
			}

			if blocktx != nil {
				var sssData string
				if blocktx.From.String() == addr.String() {
					if blocktx.Type == "coin" {
						sssData = fmt.Sprintf("FROM|%v|%v|%v", blocktx.Type, blocktx.Value, blocktx.TimeStamp)
					}
					if blocktx.Type == "token" {
						sssData = fmt.Sprintf("FROM|%v|%v|%v", blocktx.Type, blocktx.GetTokenID().String(), blocktx.TimeStamp)
					}

				}
				if blocktx.To.String() == addr.String() {
					if blocktx.Type == "coin" {
						sssData = fmt.Sprintf("TO|%v|%v|%v", blocktx.Type, blocktx.Value, blocktx.TimeStamp)
					}
					if blocktx.Type == "token" {
						sssData = fmt.Sprintf("TO|%v|%v|%v", blocktx.Type, blocktx.GetTokenID().String(), blocktx.TimeStamp)
					}
				}

				// For debugging purposes only. (Uncommenting will make for noisy console logs)
				h.logger.Debug("Sending sse to client...",
					slog.Any("data", sssData),
					slog.Any("ip_address", ipAddress))

				// Send an event to the client.
				fmt.Fprintf(w, "data: %v\n\n", sssData)
			} else {
				// For debugging purposes only. (Uncommenting will make for noisy console logs)
				h.logger.Warn("Sending empty sse to client...",
					slog.Any("ip_address", ipAddress))
				fmt.Fprintf(w, "data: \n\n")
			}

			w.(http.Flusher).Flush()
			time.Sleep(1 * time.Second)
		}
	}
}
