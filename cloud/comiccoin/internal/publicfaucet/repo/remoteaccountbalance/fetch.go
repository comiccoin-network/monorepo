// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/domain/remoteaccountbalance/repo/fetch.go
package remoteaccountbalance

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"time"

	"github.com/ethereum/go-ethereum/common"

	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/domain/remoteaccountbalance"
)

func (impl *remoteAccountBalanceImpl) FetchFromAuthority(ctx context.Context, addr *common.Address) (*dom.RemoteAccountBalance, error) {
	impl.Logger.Debug("starting to fetch remote account balance",
		slog.String("server_url", impl.Config.Blockchain.AuthorityServerURL))

	// Create registration endpoint URL
	remoteURL := fmt.Sprintf("%s/authority/api/v1/account-balance?address=", impl.Config.Blockchain.AuthorityServerURL, addr.String())

	// Create a new HTTP request with the access token in the Authorization header
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, remoteURL, nil)
	if err != nil {
		return nil, fmt.Errorf("creating request: %w", err)
	}

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
		impl.Logger.Error("Failed to get 200 OK status", slog.Any("status", resp.StatusCode))
		return nil, fmt.Errorf("non-200 status code received from gateway: %d - %s", resp.StatusCode, string(bodyBytes))
	}

	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		impl.Logger.Error("Failed to read received data", slog.Any("err", err))
		return nil, fmt.Errorf("reading response: %w", err)
	}

	// Unmarshal response to ProfileResponse
	var profile dom.RemoteAccountBalance
	if err := json.Unmarshal(body, &profile); err != nil {
		impl.Logger.Error("Failed to unmarshal", slog.Any("err", err))
		return nil, fmt.Errorf("unmarshalling response: %w", err)
	}

	return &profile, nil
}
