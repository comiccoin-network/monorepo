package repo

import (
	"bufio"
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"strings"

	"github.com/comiccoin-network/monorepo/native/desktop/comiccoin/domain"
)

//
// Copied from `github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/repo`
//

const (
	blockchainStateServerSentEventsURL string = "/api/v1/blockchain-state/sse?chain_id=${CHAIN_ID}"
)

type BlockchainStateServerSentEventsDTOConfigurationProvider interface {
	GetAuthorityAddress() string
}

type blockchainStateServerSentEventsDTOConfigurationProviderImpl struct {
	authorityAddress string
}

func NewBlockchainStateServerSentEventsDTOConfigurationProvider(authorityAddress string) BlockchainStateServerSentEventsDTOConfigurationProvider {
	return &blockchainStateServerSentEventsDTOConfigurationProviderImpl{
		authorityAddress: authorityAddress,
	}
}

func (impl *blockchainStateServerSentEventsDTOConfigurationProviderImpl) GetAuthorityAddress() string {
	return impl.authorityAddress
}

type BlockchainStateServerSentEventsDTORepo struct {
	config BlockchainStateServerSentEventsDTOConfigurationProvider
	logger *slog.Logger
}

func NewBlockchainStateServerSentEventsDTORepository(
	config BlockchainStateServerSentEventsDTOConfigurationProvider,
	logger *slog.Logger,
) domain.BlockchainStateServerSentEventsDTORepository {
	return &BlockchainStateServerSentEventsDTORepo{
		config: config,
		logger: logger,
	}
}

func (repo *BlockchainStateServerSentEventsDTORepo) SubscribeToBlockchainAuthority(ctx context.Context, chainID uint16) (<-chan string, error) {
	// Create the URL with the chain ID
	modifiedURL := strings.ReplaceAll(blockchainStateServerSentEventsURL, "${CHAIN_ID}", fmt.Sprintf("%v", chainID))
	httpEndpoint := fmt.Sprintf("%s%s", repo.config.GetAuthorityAddress(), modifiedURL)

	repo.logger.Debug("Subscribing to the Authority blockchain state server sent events stream...",
		slog.Any("http_endpoint", httpEndpoint))

	// DEVELOPERS NOTE: Why are we using `POST` method? We are doing this to
	// get our app working on DigitalOcean App Platform, see more for details:
	// "Does App Platform support SSE (Server-Sent Events) application?" via https://www.digitalocean.com/community/questions/does-app-platform-support-sse-server-sent-events-application

	// Create "POST" request (see "DEVELOPERS NOTES" above) with context.
	req, err := http.NewRequestWithContext(ctx, "POST", httpEndpoint, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers for SSE
	req.Header.Set("Cache-Control", "no-cache")
	req.Header.Set("Accept", "text/event-stream")
	req.Header.Set("Connection", "keep-alive")
	req.Header.Set("X-Accel-Buffering", "no")

	// Create an HTTP client with no timeout
	client := &http.Client{
		Timeout: 0, // Disable timeout for streaming
	}

	// Make the request
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to SSE endpoint: %w", err)
	}

	// Check response status
	if resp.StatusCode != http.StatusOK {
		resp.Body.Close()
		return nil, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	// Create channel for hash values
	hashChan := make(chan string)

	// Start goroutine to read SSE stream
	go func() {
		repo.logger.Debug("Successfully connected to the Authority blockchain state server sent events stream",
			slog.Any("http_endpoint", httpEndpoint))

		defer resp.Body.Close()
		defer close(hashChan)

		scanner := bufio.NewScanner(resp.Body)
		buf := make([]byte, 0, 1024*1024) // 1MB buffer
		scanner.Buffer(buf, 1024*1024)

		for scanner.Scan() {
			select {
			case <-ctx.Done():
				repo.logger.Info("context canceled, stopping SSE client")
				return
			default:
				line := scanner.Text()
				if strings.HasPrefix(line, "data: ") {
					hash := strings.TrimPrefix(line, "data: ")
					// repo.logger.Debug("received hash from SSE",
					// 	slog.String("hash", hash),
					// 	slog.Uint64("chain_id", uint64(chainID)))

					// Try to send the hash, but respect context cancellation
					select {
					case hashChan <- hash:
					case <-ctx.Done():
						return
					}
				}
			}
		}

		if err := scanner.Err(); err != nil {
			repo.logger.Error("error reading SSE stream",
				slog.Any("error", err),
				slog.Uint64("chain_id", uint64(chainID)))
		}
	}()

	return hashChan, nil
}
