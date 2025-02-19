// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/repo/oauth/exchange.go
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

// Constants for retry logic
const (
	maxRetries     = 3               // Maximum number of retry attempts
	initialBackoff = 1 * time.Second // Initial backoff duration
)

func (impl *oauthClientImpl) ExchangeCode(ctx context.Context, code string) (*dom_oauth.TokenResponse, error) {
	var lastErr error

	// Prepare the request data outside the retry loop
	tokenURL := fmt.Sprintf("%s/gateway/api/v1/oauth/token", impl.Config.OAuth.ServerURL)
	data := url.Values{}
	data.Set("grant_type", "authorization_code")
	data.Set("code", code)
	data.Set("client_id", impl.Config.OAuth.ClientID)
	data.Set("client_secret", impl.Config.OAuth.ClientSecret)
	data.Set("redirect_uri", impl.Config.OAuth.ClientRedirectURI)

	impl.Logger.Debug("preparing token exchange",
		slog.String("token_url", tokenURL),
		slog.String("code", code),
		slog.String("client_id", impl.Config.OAuth.ClientID),
		slog.String("redirect_uri", impl.Config.OAuth.ClientRedirectURI))

	// Implement retry loop with exponential backoff
	for attempt := 0; attempt < maxRetries; attempt++ {
		// If this isn't our first attempt, log that we're retrying
		if attempt > 0 {
			impl.Logger.Info("retrying token exchange",
				slog.Int("attempt", attempt+1),
				slog.Int("max_attempts", maxRetries))

			// Calculate exponential backoff duration
			backoff := time.Duration(1<<uint(attempt)) * initialBackoff

			// Wait before retrying, but respect context cancellation
			select {
			case <-ctx.Done():
				return nil, ctx.Err()
			case <-time.After(backoff):
			}
		}

		// Create new request
		req, err := http.NewRequestWithContext(ctx, "POST", tokenURL, strings.NewReader(data.Encode()))
		if err != nil {
			lastErr = fmt.Errorf("creating request: %w", err)
			continue
		}

		req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		req.Header.Set("Accept", "application/json")

		// Execute request
		resp, err := impl.HttpClient.Do(req)
		if err != nil {
			impl.Logger.Error("failed to execute token request",
				slog.Any("tokenURL", tokenURL),
				slog.Any("error", err),
				slog.Int("attempt", attempt+1))
			lastErr = fmt.Errorf("executing request: %w", err)
			continue
		}

		// Ensure we always close the response body
		body, err := func() ([]byte, error) {
			defer resp.Body.Close()
			return io.ReadAll(resp.Body)
		}()
		if err != nil {
			lastErr = fmt.Errorf("reading response: %w", err)
			continue
		}

		// Handle non-200 responses
		if resp.StatusCode != http.StatusOK {
			var oauthErr oauthErrorResponse
			if err := json.Unmarshal(body, &oauthErr); err != nil {
				lastErr = fmt.Errorf("unexpected error response (status %d): %s",
					resp.StatusCode, string(body))
				continue
			}

			// Don't retry if it's an invalid grant - that's permanent
			if oauthErr.Error == "invalid_grant" {
				return nil, &CodeAlreadyUsedError{
					Code:    code,
					Message: oauthErr.ErrorDescription,
				}
			}

			lastErr = fmt.Errorf("oauth error: %s - %s",
				oauthErr.Error, oauthErr.ErrorDescription)
			continue
		}

		// Parse successful response
		var tokenResp dom_oauth.TokenResponse
		if err := json.Unmarshal(body, &tokenResp); err != nil {
			lastErr = fmt.Errorf("parsing response: %w", err)
			continue
		}

		// Success! Calculate expiration and return
		tokenResp.ExpiresAt = time.Now().Add(time.Duration(tokenResp.ExpiresIn) * time.Second)

		impl.Logger.Info("successfully exchanged authorization code for tokens",
			slog.String("code", code),
			slog.Int("attempts_needed", attempt+1))

		return &tokenResp, nil
	}

	// If we get here, we've exhausted all retries
	return nil, fmt.Errorf("failed after %d attempts. Last error: %v", maxRetries, lastErr)
}
