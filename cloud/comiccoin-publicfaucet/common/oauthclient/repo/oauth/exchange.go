// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/repo/oauth/exchange.go
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

	dom_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/oauth"
)

func (impl *oauthClientImpl) ExchangeCode(ctx context.Context, code string) (*dom_oauth.TokenResponse, error) {
	tokenURL := fmt.Sprintf("%s/oauth/token", impl.Config.OAuth.ServerURL)

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
		return nil, err
	}

	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	resp, err := impl.HttpClient.Do(req)
	if err != nil {
		impl.Logger.Error("failed to exchange code",
			slog.Any("error", err))
		return nil, err
	}
	defer resp.Body.Close()

	var tokenResp dom_oauth.TokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		impl.Logger.Error("failed to decode token response",
			slog.Any("error", err))
		return nil, err
	}

	// Calculate absolute expiration time
	tokenResp.ExpiresAt = time.Now().Add(time.Duration(tokenResp.ExpiresIn) * time.Second)

	return &tokenResp, nil
}
