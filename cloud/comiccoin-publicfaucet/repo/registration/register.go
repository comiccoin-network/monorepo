// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/repo/registration/register.go
package registration

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"

	dom_registration "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/domain/registration"
)

func (impl *registrationClientImpl) Register(ctx context.Context, req *dom_registration.RegistrationRequest) (*dom_registration.RegistrationResponse, error) {
	// Create registration endpoint URL
	registrationURL := fmt.Sprintf("%s/api/register", impl.Config.OAuth.ServerURL)

	// Set the redirect URI from config if not already set
	if req.RedirectURI == "" {
		req.RedirectURI = impl.Config.OAuth.RedirectURI
	}

	impl.Logger.Debug("sending registration request",
		slog.String("email", req.Email),
		slog.String("redirect_uri", req.RedirectURI))

	// Convert request to JSON
	jsonData, err := json.Marshal(req)
	if err != nil {
		impl.Logger.Error("failed to marshal registration request",
			slog.Any("error", err))
		return nil, err
	}

	// Create HTTP request
	httpReq, err := http.NewRequestWithContext(ctx, "POST", registrationURL, bytes.NewBuffer(jsonData))
	if err != nil {
		impl.Logger.Error("failed to create registration request",
			slog.Any("error", err))
		return nil, err
	}

	// Set headers
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Accept", "application/json")

	// Add any client authentication if required
	if impl.Config.OAuth.ClientID != "" {
		httpReq.SetBasicAuth(impl.Config.OAuth.ClientID, impl.Config.OAuth.ClientSecret)
	}

	// Execute request
	resp, err := impl.HttpClient.Do(httpReq)
	if err != nil {
		impl.Logger.Error("failed to execute registration request",
			slog.Any("error", err),
			slog.String("email", req.Email))
		return nil, err
	}
	defer resp.Body.Close()

	// Handle non-200 responses
	if resp.StatusCode != http.StatusOK {
		var errorResp struct {
			Error       string `json:"error"`
			Description string `json:"error_description"`
		}
		if err := json.NewDecoder(resp.Body).Decode(&errorResp); err != nil {
			impl.Logger.Error("failed to decode error response",
				slog.Any("error", err),
				slog.Int("status_code", resp.StatusCode))
			return nil, fmt.Errorf("registration failed with status: %d", resp.StatusCode)
		}
		impl.Logger.Error("registration request failed",
			slog.String("error", errorResp.Error),
			slog.String("description", errorResp.Description),
			slog.Int("status_code", resp.StatusCode))
		return nil, fmt.Errorf("%s: %s", errorResp.Error, errorResp.Description)
	}

	// Parse successful response
	var registrationResp dom_registration.RegistrationResponse
	if err := json.NewDecoder(resp.Body).Decode(&registrationResp); err != nil {
		impl.Logger.Error("failed to decode registration response",
			slog.Any("error", err))
		return nil, err
	}

	impl.Logger.Info("registration successful",
		slog.String("email", req.Email),
		slog.String("auth_code", registrationResp.AuthCode))

	return &registrationResp, nil
}
