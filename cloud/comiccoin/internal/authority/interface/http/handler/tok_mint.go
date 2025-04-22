package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"strings"

	"github.com/ethereum/go-ethereum/common"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config/constants"
	sv_token "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/service/token"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/jwt"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/password"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/securestring"
)

type TokenMintServiceHTTPHandler struct {
	config           *config.Configuration
	logger           *slog.Logger
	jwtProvider      jwt.Provider
	passwordProvider password.Provider
	service          sv_token.TokenMintService
}

func NewTokenMintServiceHTTPHandler(
	cfg *config.Configuration,
	logger *slog.Logger,
	jwtp jwt.Provider,
	passp password.Provider,
	tokenMintService sv_token.TokenMintService,
) *TokenMintServiceHTTPHandler {
	return &TokenMintServiceHTTPHandler{cfg, logger, jwtp, passp, tokenMintService}
}

type TokenMintServiceRequestIDO struct {
	WalletAddress string `json:"wallet_address"`
	MetadataURI   string `json:"metadata_uri"`
}

type BlockchainTokenMintServiceResponseIDO struct {
}

func (h *TokenMintServiceHTTPHandler) Execute(w http.ResponseWriter, r *http.Request) {
	//
	// STEP 1:
	// Authenticate the provided API key
	//

	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		h.logger.Error("Authorization header is missing")
		http.Error(w, "Authorization header is missing", http.StatusUnauthorized)
		return
	}

	// Parse the JWT token
	apiKey := strings.TrimPrefix(authHeader, "JWT ")

	apiKeyDecoded, err := h.jwtProvider.ProcessJWTToken(apiKey)
	if err != nil {
		err := httperror.NewForUnauthorizedWithSingleField("api_key", fmt.Sprintf("bad formatting: %v", err))
		h.logger.Error("Failed processing JWT token",
			slog.Any("error", err))
		httperror.ResponseError(w, err)
		return
	}
	apiKeyPayload := strings.Split(apiKeyDecoded, "@")
	if len(apiKeyPayload) < 2 {
		err := httperror.NewForUnauthorizedWithSingleField("api_key", "corrupted payload: bad structure")
		h.logger.Error("api_key - corrupted payload: bad structure")
		httperror.ResponseError(w, err)
		return
	}
	if apiKeyPayload[0] == "" {
		err := httperror.NewForUnauthorizedWithSingleField("api_key", "corrupted payload: missing `chain_id`")
		h.logger.Error("api_key - corrupted payload: missing `chain_id`")
		httperror.ResponseError(w, err)
		return
	}
	if apiKeyPayload[1] == "" {
		err := httperror.NewForUnauthorizedWithSingleField("api_key", "corrupted payload: missing `secret`")
		h.logger.Error("api_key - corrupted payload: missing `secret`")
		httperror.ResponseError(w, err)
		return
	}
	chainID := apiKeyPayload[0]
	if chainID != fmt.Sprintf("%v", constants.ComicCoinChainID) {
		err := httperror.NewForUnauthorizedWithSingleField("api_key", "invalid: `chain_id` does not match mainnet value")
		h.logger.Error("api_key - invalid: `chain_id` does not match mainnet value")
		httperror.ResponseError(w, err)
		return
	}

	apiKeyPayloadSecure, err := securestring.NewSecureString(apiKeyPayload[1])
	if err != nil {
		h.logger.Error("failed to secure api key payload",
			slog.Any("apiKeyPayload[1]", apiKeyPayload[1]),
		)
		httperror.ResponseError(w, err)
		return
	}
	defer apiKeyPayloadSecure.Wipe()

	// Verify the api key secret and project hashed secret match.
	passwordMatch, _ := h.passwordProvider.ComparePasswordAndHash(apiKeyPayloadSecure, h.config.App.AdministrationSecretKey.String())
	if passwordMatch == false {
		err := httperror.NewForUnauthorizedWithSingleField("api_key", "unauthorized")
		h.logger.Error("password - does not match")
		// h.logger.Error("password - does not match",
		// 	slog.Any("password", apiKeyPayload[1]),
		// 	slog.Any("encodedHash", h.config.App.AdministrationSecretKey.String()),
		// )
		httperror.ResponseError(w, err)
		return
	}

	h.logger.Debug("token mint is authorized")

	//
	// STEP 2:
	// Unmarshal the payload.
	//

	ctx := r.Context()
	req, err := unmarshalTokenMintServiceRequest(ctx, r)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	waAddr := common.HexToAddress(strings.ToLower(req.WalletAddress))

	h.logger.Debug("token mint received",
		slog.Any("wallet_address", waAddr),
		slog.Any("metadata_uri", req.MetadataURI))

	//
	// STEP 3:
	// Execute in our service.
	//

	tokID, serviceExecErr := h.service.Execute(
		ctx,
		&waAddr,
		req.MetadataURI,
	)
	if serviceExecErr != nil {
		httperror.ResponseError(w, serviceExecErr)
		return
	}

	//
	// STEP 4: Return results.
	//

	_ = tokID

	w.WriteHeader(http.StatusCreated)
}

func unmarshalTokenMintServiceRequest(ctx context.Context, r *http.Request) (*TokenMintServiceRequestIDO, error) {
	// Initialize our array which will store all the results from the remote server.
	var requestData *TokenMintServiceRequestIDO

	defer r.Body.Close()

	// Read the JSON string and convert it into our Golang struct else we need
	// to send a `400 Bad Request` error message back to the client,
	err := json.NewDecoder(r.Body).Decode(&requestData) // [1]
	if err != nil {
		return nil, httperror.NewForSingleField(http.StatusBadRequest, "non_field_error", "payload structure is wrong")
	}

	return requestData, nil
}
