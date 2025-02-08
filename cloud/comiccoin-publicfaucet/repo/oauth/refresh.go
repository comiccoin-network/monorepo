// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/repo/oauth/refresh.go
package oauth

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"net/url"
	"strings"
	"time"

	dom_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/domain/oauth"
)

func (impl *oauthClientImpl) RefreshToken(ctx context.Context, refreshToken string) (*dom_oauth.TokenResponse, error) {
	tokenURL := fmt.Sprintf("%s/oauth/token", impl.Config.OAuth.ServerURL)

	data := url.Values{}
	data.Set("grant_type", "refresh_token")
	data.Set("refresh_token", refreshToken)
	data.Set("client_id", impl.Config.OAuth.ClientID)
	data.Set("client_secret", impl.Config.OAuth.ClientSecret)

	req, err := http.NewRequestWithContext(ctx, "POST", tokenURL, strings.NewReader(data.Encode()))
	if err != nil {
		impl.Logger.Error("failed to create refresh token request",
			slog.Any("error", err))
		return nil, err
	}

	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	resp, err := impl.HttpClient.Do(req)
	if err != nil {
		impl.Logger.Error("failed to refresh token",
			slog.Any("error", err))
		return nil, err
	}
	defer resp.Body.Close()

	var tokenResp dom_oauth.TokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		impl.Logger.Error("failed to decode refresh token response",
			slog.Any("error", err))
		return nil, err
	}

	// Calculate absolute expiration time
	tokenResp.ExpiresAt = time.Now().Add(time.Duration(tokenResp.ExpiresIn) * time.Second)

	return &tokenResp, nil
}
