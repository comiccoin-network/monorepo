// password_provider.go
package mocks

import (
	"github.com/stretchr/testify/mock"
)

type MockPasswordProvider struct {
	mock.Mock
}

func (m *MockPasswordProvider) GenerateSecureRandomString(length int) (string, error) {
	args := m.Called(length)
	return args.String(0), args.Error(1)
}

func (m *MockPasswordProvider) GenerateSecureRandomBytes(length int) ([]byte, error) {
	args := m.Called(length)
	return args.Get(0).([]byte), args.Error(1)
}

func (m *MockPasswordProvider) GenerateHashFromPassword(password string) (string, error) {
	args := m.Called(password)
	return args.String(0), args.Error(1)
}

func (m *MockPasswordProvider) CompareHashAndPassword(hashedPassword string, password string) error {
	args := m.Called(hashedPassword, password)
	return args.Error(0)
}

func (m *MockPasswordProvider) AlgorithmName() string {
	args := m.Called()
	return args.String(0)
}

func (m *MockPasswordProvider) ComparePasswordAndHash(password, hash string) (bool, error) {
	args := m.Called(password, hash)
	return args.Bool(0), args.Error(1)
}
