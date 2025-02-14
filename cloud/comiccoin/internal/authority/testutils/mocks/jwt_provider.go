// jwt_provider.go
package mocks

import (
	"time"

	"github.com/stretchr/testify/mock"
)

type MockJWTProvider struct {
	mock.Mock
}

func (m *MockJWTProvider) GenerateJWTToken(payload string, atExpiry time.Duration) (string, time.Time, error) {
	args := m.Called(payload, atExpiry)
	return args.String(0), args.Get(1).(time.Time), args.Error(2)
}

func (m *MockJWTProvider) ValidateToken(tokenString string) (string, error) {
	args := m.Called(tokenString)
	return args.String(0), args.Error(1)
}

func (m *MockJWTProvider) GenerateJWTTokenPair(payload string, atExpiry, rtExpiry time.Duration) (string, time.Time, string, time.Time, error) {
	args := m.Called(payload, atExpiry, rtExpiry)
	return args.String(0), args.Get(1).(time.Time), args.String(2), args.Get(3).(time.Time), args.Error(4)
}

func (m *MockJWTProvider) ProcessJWTToken(tokenString string) (string, error) {
	args := m.Called(tokenString)
	return args.String(0), args.Error(1)
}
