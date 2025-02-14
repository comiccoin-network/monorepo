// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/oauth/memory/store.go
package memory

import (
	"sync"
	"time"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/oauth"
)

// MemoryStore implements AuthorizationStore using in-memory storage
type MemoryStore struct {
	mu          sync.RWMutex
	pendingAuth map[string]oauth.PendingAuthorization
	authCodes   map[string]oauth.AuthorizationCode
}

// NewMemoryStore creates a new instance of MemoryStore
func NewMemoryStore() *MemoryStore {
	return &MemoryStore{
		pendingAuth: make(map[string]oauth.PendingAuthorization),
		authCodes:   make(map[string]oauth.AuthorizationCode),
	}
}

// StorePendingAuth implements AuthorizationStore
func (s *MemoryStore) StorePendingAuth(authID string, auth oauth.PendingAuthorization) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.pendingAuth[authID] = auth

	// Start cleanup goroutine
	go func() {
		time.Sleep(time.Until(auth.ExpiresAt))
		s.mu.Lock()
		delete(s.pendingAuth, authID)
		s.mu.Unlock()
	}()

	return nil
}

// GetPendingAuth implements AuthorizationStore
func (s *MemoryStore) GetPendingAuth(authID string) (oauth.PendingAuthorization, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	auth, exists := s.pendingAuth[authID]
	if !exists {
		return oauth.PendingAuthorization{}, oauth.ErrAuthorizationNotFound
	}

	if time.Now().After(auth.ExpiresAt) {
		delete(s.pendingAuth, authID)
		return oauth.PendingAuthorization{}, oauth.ErrAuthorizationNotFound
	}

	return auth, nil
}

// DeletePendingAuth implements AuthorizationStore
func (s *MemoryStore) DeletePendingAuth(authID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.pendingAuth[authID]; !exists {
		return oauth.ErrAuthorizationNotFound
	}

	delete(s.pendingAuth, authID)
	return nil
}

// StoreAuthorizationCode implements AuthorizationStore
func (s *MemoryStore) StoreAuthorizationCode(code string, auth oauth.AuthorizationCode) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.authCodes[code] = auth

	// Start cleanup goroutine
	go func() {
		time.Sleep(time.Until(auth.ExpiresAt))
		s.mu.Lock()
		delete(s.authCodes, code)
		s.mu.Unlock()
	}()

	return nil
}

// GetAuthorizationCode implements AuthorizationStore
func (s *MemoryStore) GetAuthorizationCode(code string) (oauth.AuthorizationCode, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	auth, exists := s.authCodes[code]
	if !exists {
		return oauth.AuthorizationCode{}, oauth.ErrAuthorizationNotFound
	}

	if time.Now().After(auth.ExpiresAt) {
		delete(s.authCodes, code)
		return oauth.AuthorizationCode{}, oauth.ErrAuthorizationNotFound
	}

	return auth, nil
}

// DeleteAuthorizationCode implements AuthorizationStore
func (s *MemoryStore) DeleteAuthorizationCode(code string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.authCodes[code]; !exists {
		return oauth.ErrAuthorizationNotFound
	}

	delete(s.authCodes, code)
	return nil
}
