// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/repo/remotefederatedidentity/get.go
package remotefederatedidentity

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"time"

	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/remotefederatedidentity"
)

func (impl *remoteFederatedIdentityImpl) FetchFromRemoteByAccessToken(ctx context.Context, accessToken string) (*dom.RemoteFederatedIdentityDTO, error) {
	impl.Logger.Debug("starting to fetch remote federated identity",
		slog.String("server_url", impl.Config.OAuth.ServerURL))

	// Create registration endpoint URL
	profileURL := fmt.Sprintf("%s/api/federated-identity", impl.Config.OAuth.ServerURL)

	// Create a new HTTP request with the access token in the Authorization header
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, profileURL, nil)
	if err != nil {
		return nil, fmt.Errorf("creating request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)

	// Create a timeout context
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	// Execute the request with timeout
	client := http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("executing request: %w", err)
	}
	defer resp.Body.Close()

	// Handle non-200 status codes
	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("non-200 status code received from gateway: %d - %s", resp.StatusCode, string(bodyBytes))
	}

	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("reading response: %w", err)
	}

	// Unmarshal response to ProfileResponse
	var profile dom.RemoteFederatedIdentityDTO
	if err := json.Unmarshal(body, &profile); err != nil {
		return nil, fmt.Errorf("unmarshalling response: %w", err)
	}

	return &profile, nil
}
