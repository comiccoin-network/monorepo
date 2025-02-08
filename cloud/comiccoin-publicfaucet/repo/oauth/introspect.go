// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/repo/oauth/introspect.go
package oauth

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"net/url"
	"strings"

	dom_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/domain/oauth"
)

func (impl *oauthClientImpl) IntrospectToken(ctx context.Context, token string) (*dom_oauth.IntrospectionResponse, error) {
	introspectURL := fmt.Sprintf("%s/oauth/introspect", impl.Config.OAuth.ServerURL)

	data := url.Values{}
	data.Set("token", token)

	req, err := http.NewRequestWithContext(ctx, "POST", introspectURL, strings.NewReader(data.Encode()))
	if err != nil {
		impl.Logger.Error("failed to create introspection request",
			slog.Any("error", err))
		return nil, err
	}

	req.SetBasicAuth(impl.Config.OAuth.ClientID, impl.Config.OAuth.ClientSecret)
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	resp, err := impl.HttpClient.Do(req)
	if err != nil {
		impl.Logger.Error("failed to introspect token",
			slog.Any("error", err))
		return nil, err
	}
	defer resp.Body.Close()

	var introspectResp dom_oauth.IntrospectionResponse
	if err := json.NewDecoder(resp.Body).Decode(&introspectResp); err != nil {
		impl.Logger.Error("failed to decode introspection response",
			slog.Any("error", err))
		return nil, err
	}

	return &introspectResp, nil
}
