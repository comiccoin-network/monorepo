package apikey

import (
	"io"
	"log/slog"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/testutils/mocks"
)

func TestGenerateAPIKeyUseCase_Execute(t *testing.T) {
	// Common setup
	logger := slog.New(slog.NewTextHandler(io.Discard, nil))

	t.Run("success case", func(t *testing.T) {
		// Setup
		mockPass := new(mocks.MockPasswordProvider)
		mockJWT := new(mocks.MockJWTProvider)

		// Expected values
		expectedRandomStr := "random_string_123"
		expectedHash := "hashed_password_456"
		expectedAPIKey := "api_key_789"
		expiryTime := time.Now().Add(250 * 24 * time.Hour)
		chainID := uint16(1)

		// Configure mocks
		mockPass.On("GenerateSecureRandomString", 64).Return(expectedRandomStr, nil)
		mockPass.On("GenerateHashFromPassword", expectedRandomStr).Return(expectedHash, nil)
		// Remove the AlgorithmName expectation since it's not used
		mockJWT.On("GenerateJWTToken",
			"1@random_string_123",
			250*24*time.Hour).Return(expectedAPIKey, expiryTime, nil)

		useCase := NewGenerateAPIKeyUseCase(logger, mockPass, mockJWT)

		// Execute
		result, err := useCase.Execute(chainID)

		// Assert
		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Equal(t, expectedHash, result.SecretString)
		assert.Equal(t, expectedAPIKey, result.APIKey)
		mockPass.AssertExpectations(t)
		mockJWT.AssertExpectations(t)
	})
}
