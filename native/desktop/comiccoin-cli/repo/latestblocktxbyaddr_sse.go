package repo

import (
	"bufio"
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"strings"

	"github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/domain"
	"github.com/ethereum/go-ethereum/common"
)

//
// Copied from `github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/repo`
//

const (
	getLatestBlockTransactionByAddressServerSentEventsURL string = "/api/v1/latest-block-transaction/sse?address=${ADDRESS}"
)

type GetLatestBlockTransactionByAddressServerSentEventsDTOConfigurationProvider interface {
	GetAuthorityAddress() string
}

type getLatestBlockTransactionByAddressServerSentEventsDTOConfigurationProviderImpl struct {
	authorityAddress string
}

func NewGetLatestBlockTransactionByAddressServerSentEventsDTOConfigurationProvider(authorityAddress string) GetLatestBlockTransactionByAddressServerSentEventsDTOConfigurationProvider {
	return &getLatestBlockTransactionByAddressServerSentEventsDTOConfigurationProviderImpl{
		authorityAddress: authorityAddress,
	}
}

func (impl *getLatestBlockTransactionByAddressServerSentEventsDTOConfigurationProviderImpl) GetAuthorityAddress() string {
	return impl.authorityAddress
}

type GetLatestBlockTransactionByAddressServerSentEventsDTORepo struct {
	config GetLatestBlockTransactionByAddressServerSentEventsDTOConfigurationProvider
	logger *slog.Logger
}

func NewGetLatestBlockTransactionByAddressServerSentEventsDTORepository(
	config GetLatestBlockTransactionByAddressServerSentEventsDTOConfigurationProvider,
	logger *slog.Logger,
) domain.GetLatestBlockTransactionByAddressServerSentEventsDTORepository {
	return &GetLatestBlockTransactionByAddressServerSentEventsDTORepo{
		config: config,
		logger: logger,
	}
}

func (repo *GetLatestBlockTransactionByAddressServerSentEventsDTORepo) SubscribeToBlockchainAuthority(ctx context.Context, address *common.Address) (<-chan string, error) {
	// Create the URL with the address
	modifiedURL := strings.ReplaceAll(getLatestBlockTransactionByAddressServerSentEventsURL, "${ADDRESS}", fmt.Sprintf("%v", address.String()))
	httpEndpoint := fmt.Sprintf("%s%s", repo.config.GetAuthorityAddress(), modifiedURL)

	repo.logger.Debug("Subscribing to the Authority blockchain SSE stream...",
		slog.Any("http_endpoint", httpEndpoint))

	// Create POST request with context
	req, err := http.NewRequestWithContext(ctx, "POST", httpEndpoint, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers for SSE
	req.Header.Set("Cache-Control", "no-cache")
	req.Header.Set("Accept", "text/event-stream")
	req.Header.Set("Connection", "keep-alive")
	req.Header.Set("X-Accel-Buffering", "no")

	// Create HTTP client with no timeout for streaming
	client := &http.Client{
		Timeout: 0,
	}

	// Make the request
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to SSE endpoint: %w", err)
	}

	// Verify response status
	if resp.StatusCode != http.StatusOK {
		resp.Body.Close()
		return nil, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	// Create buffered channel for notifications
	hashChan := make(chan string, 1)

	// Start goroutine to read SSE stream
	go func() {
		// Ensure cleanup on goroutine exit
		defer func() {
			resp.Body.Close()
			close(hashChan)
		}()

		repo.logger.Debug("Connected to Authority blockchain SSE stream",
			slog.Any("http_endpoint", httpEndpoint))

		scanner := bufio.NewScanner(resp.Body)
		buf := make([]byte, 0, 1024*1024) // 1MB buffer
		scanner.Buffer(buf, 1024*1024)

		for scanner.Scan() {
			select {
			case <-ctx.Done():
				repo.logger.Info("Context canceled, stopping SSE client")
				return
			default:
				line := scanner.Text()
				if strings.HasPrefix(line, "data: ") {
					hash := strings.TrimPrefix(line, "data: ")

					// Try to send the hash, respecting context cancellation
					select {
					case hashChan <- hash:
					case <-ctx.Done():
						repo.logger.Info("Context canceled while sending hash")
						return
					}
				}
			}
		}

		if err := scanner.Err(); err != nil {
			repo.logger.Error("Error reading SSE stream",
				slog.Any("error", err),
				slog.String("address", address.String()))
		}
	}()

	return hashChan, nil
}
