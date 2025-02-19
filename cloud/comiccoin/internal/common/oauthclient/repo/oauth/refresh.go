// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/repo/oauth/refresh.go
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

	dom_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/domain/oauth"
)

func (impl *oauthClientImpl) RefreshToken(ctx context.Context, refreshToken string) (*dom_oauth.TokenResponse, error) {
	tokenURL := fmt.Sprintf("%s/gateway/api/v1/oauth/refresh", impl.Config.OAuth.ServerURL) // Notice we're using /oauth/refresh now

	impl.Logger.Debug("preparing token refresh request",
		slog.String("url", tokenURL),
		slog.String("client_id", impl.Config.OAuth.ClientID))

	// Prepare form data exactly as the server expects
	data := url.Values{}
	data.Set("grant_type", "refresh_token")                   // This is required
	data.Set("refresh_token", refreshToken)                   // Required
	data.Set("client_id", impl.Config.OAuth.ClientID)         // Required
	data.Set("client_secret", impl.Config.OAuth.ClientSecret) // Required

	// Create request
	req, err := http.NewRequestWithContext(ctx, "POST", tokenURL, strings.NewReader(data.Encode()))
	if err != nil {
		impl.Logger.Error("failed to create refresh token request",
			slog.Any("error", err))
		return nil, fmt.Errorf("creating request: %w", err)
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	impl.Logger.Debug("sending token refresh request",
		slog.String("method", req.Method),
		slog.String("url", req.URL.String()),
		slog.String("content_type", req.Header.Get("Content-Type")))

	// Send request
	resp, err := impl.HttpClient.Do(req)
	if err != nil {
		impl.Logger.Error("failed to send refresh token request",
			slog.Any("error", err))
		return nil, fmt.Errorf("sending request: %w", err)
	}
	defer resp.Body.Close()

	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		impl.Logger.Error("failed to read response body",
			slog.Any("error", err))
		return nil, fmt.Errorf("reading response: %w", err)
	}

	impl.Logger.Debug("received response from OAuth server",
		slog.Int("status_code", resp.StatusCode),
		slog.String("content_type", resp.Header.Get("Content-Type")),
		slog.Int("body_length", len(body)))

	// Handle non-200 responses
	if resp.StatusCode != http.StatusOK {
		var oauthError struct {
			Error            string `json:"error"`
			ErrorDescription string `json:"error_description"`
		}
		if err := json.Unmarshal(body, &oauthError); err == nil {
			impl.Logger.Error("OAuth server returned error",
				slog.String("error", oauthError.Error),
				slog.String("description", oauthError.ErrorDescription))

			// Here's where we add the case statement
			switch oauthError.Error {
			case "invalid_grant":
				if strings.Contains(oauthError.ErrorDescription, "session has expired") {
					return nil, fmt.Errorf("your session has expired - please log in again to continue")
				}
				return nil, fmt.Errorf("refresh token is no longer valid - please log in again")
			default:
				return nil, fmt.Errorf("OAuth error: %s - %s", oauthError.Error, oauthError.ErrorDescription)
			}
		}
		return nil, fmt.Errorf("OAuth server returned status %d: %s", resp.StatusCode, body)
	}

	// Parse successful response
	var tokenResp dom_oauth.TokenResponse
	if err := json.Unmarshal(body, &tokenResp); err != nil {
		impl.Logger.Error("failed to parse token response",
			slog.Any("error", err),
			slog.String("response_body", string(body)))
		return nil, fmt.Errorf("parsing response: %w", err)
	}

	// Set expiration time
	tokenResp.ExpiresAt = time.Now().Add(time.Duration(tokenResp.ExpiresIn) * time.Second)

	impl.Logger.Info("successfully refreshed token",
		slog.Int("expires_in", tokenResp.ExpiresIn),
		slog.Time("expires_at", tokenResp.ExpiresAt))

	return &tokenResp, nil
}
