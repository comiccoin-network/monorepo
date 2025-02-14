// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/repo/oauth/introspect.go
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

	dom_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/domain/oauth"
)

func (impl *oauthClientImpl) IntrospectToken(ctx context.Context, token string) (*dom_oauth.IntrospectionResponse, error) {
	impl.Logger.Debug("starting token introspection",
		slog.String("server_url", impl.Config.OAuth.ServerURL))

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

	// Log request details
	impl.Logger.Debug("sending introspection request",
		slog.String("url", introspectURL),
		slog.String("client_id", impl.Config.OAuth.ClientID))

	resp, err := impl.HttpClient.Do(req)
	if err != nil {
		impl.Logger.Error("failed to introspect token",
			slog.Any("error", err))
		return nil, err
	}
	defer resp.Body.Close()

	// Log response status
	impl.Logger.Debug("received introspection response",
		slog.Int("status_code", resp.StatusCode))

	// Read the raw response body first
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		impl.Logger.Error("failed to read response body",
			slog.Any("error", err))
		return nil, err
	}

	// Log raw response
	impl.Logger.Debug("raw introspection response",
		slog.String("body", string(body)))

	var introspectResp dom_oauth.IntrospectionResponse
	if err := json.Unmarshal(body, &introspectResp); err != nil {
		impl.Logger.Error("failed to decode introspection response",
			slog.Any("error", err),
			slog.String("body", string(body)))
		return nil, err
	}

	// Log decoded response
	impl.Logger.Info("decoded introspection response",
		slog.Any("federatedidentity_id", introspectResp.FederatedIdentityID),
		slog.Bool("active", introspectResp.Active),
		slog.String("client_id", introspectResp.ClientID),
		slog.String("scope", introspectResp.Scope),
		slog.Int64("expires_at", introspectResp.ExpiresAt),
		slog.Int64("issued_at", introspectResp.IssuedAt))

	return &introspectResp, nil
}
