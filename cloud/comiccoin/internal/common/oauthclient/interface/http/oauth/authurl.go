// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/interface/http/handler/oauth/authurl.go
package oauth

import (
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"strings"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/config"
	service_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/service/oauth"
)

type GetAuthURLHTTPHandler struct {
	config  *config.Configuration
	logger  *slog.Logger
	service service_oauth.GetAuthURLService
}

func NewGetAuthURLHTTPHandler(
	config *config.Configuration,
	logger *slog.Logger,
	service service_oauth.GetAuthURLService,
) *GetAuthURLHTTPHandler {
	return &GetAuthURLHTTPHandler{
		config:  config,
		logger:  logger,
		service: service,
	}
}

type authUrlRequestIDO struct {
	RedirectURI string `json:"redirect_uri"`
	Scope       string `json:"scope"`
}

type authUrlResponseIDO struct {
	AuthURL   string `json:"auth_url"`
	State     string `json:"state"`
	ExpiresAt int64  `json:"expires_at"`
}

func (h *GetAuthURLHTTPHandler) Execute(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var requestIDO authUrlRequestIDO

	// First try to get parameters from query string
	redirectURI := r.URL.Query().Get("redirect_uri")
	scope := r.URL.Query().Get("scope")
	scope = strings.Replace(scope, " ", "", -1) // Defensive code - remove whitespaces

	if redirectURI != "" {
		// If parameters are in query string, use them
		requestIDO = authUrlRequestIDO{
			RedirectURI: redirectURI,
			Scope:       scope,
		}
	} else {
		// Fall back to reading from body
		body, err := io.ReadAll(r.Body)
		if err != nil {
			h.logger.Error("failed to read request body",
				slog.Any("error", err))
			httperror.ResponseError(w, httperror.NewForBadRequest(nil))
			return
		}
		defer r.Body.Close()

		if err := json.Unmarshal(body, &requestIDO); err != nil {
			h.logger.Error("failed to unmarshal request body",
				slog.Any("error", err))
			httperror.ResponseError(w, httperror.NewForBadRequest(nil))
			return
		}
	}

	if redirectURI == "" {
		h.logger.Error("missing required `redirect_uri` value")
		httperror.ResponseError(w, httperror.NewForBadRequestWithSingleField("redirect_uri", "required value"))
		return
	}
	if scope == "" {
		h.logger.Error("missing required `scope` value")
		httperror.ResponseError(w, httperror.NewForBadRequestWithSingleField("scope", "required value"))
		return
	}

	// Convert IDO to service request
	request := &service_oauth.GetAuthURLRequest{
		RedirectURI: requestIDO.RedirectURI,
		Scope:       requestIDO.Scope,
	}

	// Call service
	response, err := h.service.Execute(r.Context(), request)
	if err != nil {
		h.logger.Error("failed to get authorization URL",
			slog.Any("error", err))
		httperror.ResponseError(w, err)
		return
	}

	// Convert service response to IDO
	responseIDO := authUrlResponseIDO{
		AuthURL:   response.AuthURL,
		State:     response.State,
		ExpiresAt: response.ExpiresAt.Unix(),
	}

	// Encode response
	if err := json.NewEncoder(w).Encode(responseIDO); err != nil {
		h.logger.Error("failed to encode response",
			slog.Any("error", err))
		httperror.ResponseError(w, err)
		return
	}

	h.logger.Info("authorization URL generated successfully",
		slog.String("auth_url", response.AuthURL),
		slog.String("state", response.State),
		slog.Any("expires_at", response.ExpiresAt))
}
