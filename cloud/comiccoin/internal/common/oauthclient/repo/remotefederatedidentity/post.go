// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/repo/remotefederatedidentity/post.go
package remotefederatedidentity

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"time"

	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/domain/remotefederatedidentity"
)

func (impl *remoteFederatedIdentityImpl) PostUpdateToRemote(ctx context.Context, req *dom.RemoteFederatedIdentityDTO, accessToken string) error {
	impl.Logger.Debug("starting to update remote federated identity",
		slog.String("server_url", impl.Config.OAuth.ServerURL))

	// Create registration endpoint URL
	profileURL := fmt.Sprintf("%s/api/federated-identity", impl.Config.OAuth.ServerURL)

	// Marshal the request body
	reqBody, err := json.Marshal(req)
	if err != nil {
		return fmt.Errorf("marshalling request body: %w", err)
	}

	// Create a new HTTP request with the access token in the Authorization header
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, profileURL, bytes.NewBuffer(reqBody))
	if err != nil {
		return fmt.Errorf("creating request: %w", err)
	}
	httpReq.Header.Set("Authorization", "Bearer "+accessToken)
	httpReq.Header.Set("Content-Type", "application/json")

	// Create a timeout context
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	// Execute the request with timeout
	client := http.Client{}
	resp, err := client.Do(httpReq)
	if err != nil {
		return fmt.Errorf("executing request: %w", err)
	}
	defer resp.Body.Close()

	// Handle non-200 status codes
	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("non-200 status code received from gateway: %d - %s", resp.StatusCode, string(bodyBytes))
	}

	// Since this is an update operation, we don't expect a response body
	// but if there is one, we can read and discard it
	_, err = io.Copy(io.Discard, resp.Body)
	if err != nil {
		return fmt.Errorf("reading response body: %w", err)
	}

	return nil
}
