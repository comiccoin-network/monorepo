package mongodbcache

import (
	"context"
	"errors"
	"log/slog"
	"testing"
	"time"

	c "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/config"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	mongo_client "go.mongodb.org/mongo-driver/mongo"
)

// MockCache is a mock implementation of cachego.Cache
type MockCache struct {
	mock.Mock
}

func (m *MockCache) Save(key string, value interface{}, lifeTime time.Duration) error {
	args := m.Called(key, value, lifeTime)
	return args.Error(0)
}

// Fixed Fetch method to match cachego.Cache interface
func (m *MockCache) Fetch(key string) (string, error) {
	args := m.Called(key)
	if args.Get(0) == nil {
		return "", args.Error(1)
	}
	return args.String(0), args.Error(1)
}

func (m *MockCache) Contains(key string) bool {
	args := m.Called(key)
	return args.Bool(0)
}

func (m *MockCache) Delete(key string) error {
	args := m.Called(key)
	return args.Error(0)
}

func (m *MockCache) Flush() error {
	args := m.Called()
	return args.Error(0)
}

// Setup function to create a new cache instance with mocked dependencies
func setupTestCache() (Cacher, *MockCache) {
	mockCache := new(MockCache)
	logger := slog.Default()

	return &cacheImpl{
		Client: mockCache,
		Logger: logger,
	}, mockCache
}

func TestNewCache(t *testing.T) {
	cfg := &c.Configuration{
		DB: c.DB{
			Name: "testdb",
		},
	}
	logger := slog.Default()
	client := &mongo_client.Client{}

	cacheInstance := NewCache(cfg, logger, client)

	assert.NotNil(t, cacheInstance, "Cache instance should not be nil")
	_, ok := cacheInstance.(*cacheImpl)
	assert.True(t, ok, "Cache should be of type *cacheImpl")
}

func TestCacheGet(t *testing.T) {
	cacheInstance, mockCache := setupTestCache()
	ctx := context.Background()

	tests := []struct {
		name        string
		key         string
		mockValue   string
		mockError   error
		expectValue []byte
		expectError bool
	}{
		{
			name:        "Successful Get",
			key:         "test-key",
			mockValue:   "test-value",
			mockError:   nil,
			expectValue: []byte("test-value"),
			expectError: false,
		},
		{
			name:        "Get Error",
			key:         "error-key",
			mockValue:   "",
			mockError:   errors.New("fetch error"),
			expectValue: nil,
			expectError: true,
		},
		{
			name:        "Empty Value",
			key:         "empty-key",
			mockValue:   "",
			mockError:   nil,
			expectValue: []byte(""),
			expectError: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockCache.On("Fetch", tt.key).Return(tt.mockValue, tt.mockError).Once()

			value, err := cacheInstance.Get(ctx, tt.key)

			if tt.expectError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expectValue, value)
			}

			mockCache.AssertExpectations(t)
		})
	}
}

func TestCacheSet(t *testing.T) {
	cacheInstance, mockCache := setupTestCache()
	ctx := context.Background()

	tests := []struct {
		name        string
		key         string
		value       []byte
		mockError   error
		expectError bool
	}{
		{
			name:        "Successful Set",
			key:         "test-key",
			value:       []byte("test-value"),
			mockError:   nil,
			expectError: false,
		},
		{
			name:        "Set Error",
			key:         "error-key",
			value:       []byte("error-value"),
			mockError:   errors.New("save error"),
			expectError: true,
		},
		{
			name:        "Empty Value",
			key:         "empty-key",
			value:       []byte(""),
			mockError:   nil,
			expectError: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockCache.On("Save", tt.key, string(tt.value), time.Duration(0)).Return(tt.mockError).Once()

			err := cacheInstance.Set(ctx, tt.key, tt.value)

			if tt.expectError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}

			mockCache.AssertExpectations(t)
		})
	}
}

func TestCacheSetWithExpiry(t *testing.T) {
	cacheInstance, mockCache := setupTestCache()
	ctx := context.Background()

	tests := []struct {
		name        string
		key         string
		value       []byte
		expiry      time.Duration
		mockError   error
		expectError bool
	}{
		{
			name:        "Successful Set with Expiry",
			key:         "test-key",
			value:       []byte("test-value"),
			expiry:      time.Hour,
			mockError:   nil,
			expectError: false,
		},
		{
			name:        "Set with Expiry Error",
			key:         "error-key",
			value:       []byte("error-value"),
			expiry:      time.Minute,
			mockError:   errors.New("save error"),
			expectError: true,
		},
		{
			name:        "Zero Expiry",
			key:         "zero-expiry-key",
			value:       []byte("test-value"),
			expiry:      0,
			mockError:   nil,
			expectError: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockCache.On("Save", tt.key, string(tt.value), tt.expiry).Return(tt.mockError).Once()

			err := cacheInstance.SetWithExpiry(ctx, tt.key, tt.value, tt.expiry)

			if tt.expectError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}

			mockCache.AssertExpectations(t)
		})
	}
}

func TestCacheDelete(t *testing.T) {
	cacheInstance, mockCache := setupTestCache()
	ctx := context.Background()

	tests := []struct {
		name        string
		key         string
		mockError   error
		expectError bool
	}{
		{
			name:        "Successful Delete",
			key:         "test-key",
			mockError:   nil,
			expectError: false,
		},
		{
			name:        "Delete Error",
			key:         "error-key",
			mockError:   errors.New("delete error"),
			expectError: true,
		},
		{
			name:        "Empty Key",
			key:         "",
			mockError:   nil,
			expectError: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockCache.On("Delete", tt.key).Return(tt.mockError).Once()

			err := cacheInstance.Delete(ctx, tt.key)

			if tt.expectError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}

			mockCache.AssertExpectations(t)
		})
	}
}

func TestCacheShutdown(t *testing.T) {
	cacheInstance, _ := setupTestCache()

	assert.NotPanics(t, func() {
		cacheInstance.Shutdown()
	})
}
