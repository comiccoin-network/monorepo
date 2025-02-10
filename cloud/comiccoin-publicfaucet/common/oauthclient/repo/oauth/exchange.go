// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/repo/oauth/exchange.go
package oauth

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/url"
	"strings"
	"time"

	dom_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/oauth"
)

// oauthErrorResponse represents the OAuth 2.0 error response format
type oauthErrorResponse struct {
	Error            string `json:"error"`
	ErrorDescription string `json:"error_description"`
}

func (impl *oauthClientImpl) ExchangeCode(ctx context.Context, code string) (*dom_oauth.TokenResponse, error) {
	tokenURL := fmt.Sprintf("%s/oauth/token", impl.Config.OAuth.ServerURL)

	// Log the attempt
	impl.Logger.Debug("attempting to exchange authorization code",
		slog.String("code", code))

	data := url.Values{}
	data.Set("grant_type", "authorization_code")
	data.Set("code", code)
	data.Set("client_id", impl.Config.OAuth.ClientID)
	data.Set("client_secret", impl.Config.OAuth.ClientSecret)
	data.Set("redirect_uri", impl.Config.OAuth.RedirectURI)

	req, err := http.NewRequestWithContext(ctx, "POST", tokenURL, strings.NewReader(data.Encode()))
	if err != nil {
		impl.Logger.Error("failed to create token request",
			slog.Any("error", err))
		return nil, fmt.Errorf("creating request: %w", err)
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Accept", "application/json")

	resp, err := impl.HttpClient.Do(req)
	if err != nil {
		impl.Logger.Error("failed to execute token request",
			slog.Any("error", err))
		return nil, fmt.Errorf("executing request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		impl.Logger.Error("failed to read response body",
			slog.Any("error", err))
		return nil, fmt.Errorf("reading response: %w", err)
	}

	// Check for error responses
	if resp.StatusCode != http.StatusOK {
		var oauthErr oauthErrorResponse
		if err := json.Unmarshal(body, &oauthErr); err != nil {
			return nil, fmt.Errorf("unexpected error response (status %d): %s",
				resp.StatusCode, string(body))
		}

		// Special handling for already used codes
		if oauthErr.Error == "invalid_grant" {
			impl.Logger.Error("authorization code invalid or already used",
				slog.String("code", code))
			return nil, &CodeAlreadyUsedError{
				Code:    code,
				Message: oauthErr.ErrorDescription,
			}
		}

		return nil, fmt.Errorf("oauth error: %s - %s",
			oauthErr.Error, oauthErr.ErrorDescription)
	}

	var tokenResp dom_oauth.TokenResponse
	if err := json.Unmarshal(body, &tokenResp); err != nil {
		impl.Logger.Error("failed to parse token response",
			slog.String("body", string(body)),
			slog.Any("error", err))
		return nil, fmt.Errorf("parsing response: %w", err)
	}

	// Calculate absolute expiration time
	tokenResp.ExpiresAt = time.Now().Add(time.Duration(tokenResp.ExpiresIn) * time.Second)

	impl.Logger.Info("successfully exchanged authorization code for tokens",
		slog.String("code", code))

	return &tokenResp, nil
}

// Add a specific error type for used codes
type CodeAlreadyUsedError struct {
	Code    string
	Message string
}

func (e *CodeAlreadyUsedError) Error() string {
	return fmt.Sprintf("authorization code already used: %s", e.Message)
}
