// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/interface/http/hello/hello.go
package hello

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/config"
	service_hello "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/service/hello"
)

type GetHelloHTTPHandler struct {
	config  *config.Configuration
	logger  *slog.Logger
	service service_hello.HelloService
}

func NewGetHelloHTTPHandler(
	config *config.Configuration,
	logger *slog.Logger,
	service service_hello.HelloService,
) *GetHelloHTTPHandler {
	return &GetHelloHTTPHandler{
		config:  config,
		logger:  logger,
		service: service,
	}
}

func (h *GetHelloHTTPHandler) Execute(w http.ResponseWriter, r *http.Request) {
	// Set response content type
	w.Header().Set("Content-Type", "application/json")

	// Call service
	response, err := h.service.SayHello(r.Context())
	if err != nil {
		h.logger.Error("failed to say hello",
			slog.Any("error", err))
		httperror.ResponseError(w, err)
		return
	}

	// Encode response
	if err := json.NewEncoder(w).Encode(response); err != nil {
		h.logger.Error("failed to encode response",
			slog.Any("error", err))
		httperror.ResponseError(w, err)
		return
	}

	h.logger.Info("hello request processed successfully",
		slog.String("user", response.User.Email))
}
