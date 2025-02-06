// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/oauth/memory/client.go
package memory

import (
	"sync"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/oauth"
)

// MemoryClientService implements ClientService using in-memory storage
type MemoryClientService struct {
	mu      sync.RWMutex
	clients map[string]oauth.Client
}

// NewMemoryClientService creates a new instance of MemoryClientService
func NewMemoryClientService() *MemoryClientService {
	return &MemoryClientService{
		clients: map[string]oauth.Client{
			"test_client": {
				ID:          "test_client",                    // This is for test/learning purposes and absolutely not going to be used moving forward.
				Secret:      "test_secret",                    // This is for test/learning purposes and absolutely not going to be used moving forward.
				RedirectURI: "http://localhost:8081/callback", // REPLACE WITH CONFIG VERIABLE
			},
		},
	}
}

// ValidateClient implements ClientService
func (s *MemoryClientService) ValidateClient(clientID, redirectURI string) (bool, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	client, exists := s.clients[clientID]
	if !exists {
		return false, nil
	}
	return client.RedirectURI == redirectURI, nil
}

// ValidateClientCredentials implements ClientService
func (s *MemoryClientService) ValidateClientCredentials(clientID, clientSecret string) (bool, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	client, exists := s.clients[clientID]
	if !exists {
		return false, nil
	}
	return client.Secret == clientSecret, nil
}

// GetClient implements ClientService
func (s *MemoryClientService) GetClient(clientID string) (*oauth.Client, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	client, exists := s.clients[clientID]
	if !exists {
		return nil, oauth.ErrInvalidClient
	}
	return &client, nil
}
