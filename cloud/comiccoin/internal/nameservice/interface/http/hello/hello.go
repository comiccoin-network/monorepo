// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/nameservice/interface/http/hello/hello.go
package hello

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	service_hello "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/nameservice/service/hello"
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
		slog.String("federatedidentity", response.FederatedIdentity.Email))
}
