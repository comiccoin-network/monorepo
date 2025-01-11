package account

import (
	"context"
	"io"
	"log/slog"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/testutils/mocks"
)

func TestGetAccountsHashStateUseCase_Execute(t *testing.T) {
	// Common setup
	cfg := &config.Configuration{
		Blockchain: config.BlockchainConfig{
			ChainID: 1,
		},
	}
	logger := slog.New(slog.NewTextHandler(io.Discard, nil))

	t.Run("success case", func(t *testing.T) {
		// Setup
		expectedHash := "0xdeadbeef"
		chainID := uint16(1)

		// Create mock repository
		repo := &mocks.AccountRepository{}
		repo.HashStateByChainIDResult = expectedHash

		useCase := NewGetAccountsHashStateUseCase(cfg, logger, repo)

		// Execute
		hash, err := useCase.Execute(context.Background(), chainID)

		// Assert
		assert.NoError(t, err)
		assert.Equal(t, expectedHash, hash)
	})

	t.Run("error - repository fails", func(t *testing.T) {
		// Setup
		chainID := uint16(1)

		// Create mock repository with error
		repo := &mocks.AccountRepository{}
		repo.HashStateByChainIDError = assert.AnError

		useCase := NewGetAccountsHashStateUseCase(cfg, logger, repo)

		// Execute
		hash, err := useCase.Execute(context.Background(), chainID)

		// Assert
		assert.Error(t, err)
		assert.Equal(t, "", hash)
		assert.Equal(t, assert.AnError, err)
	})

	t.Run("success - empty account list", func(t *testing.T) {
		// Setup
		expectedHash := "0x0" // or whatever hash you expect for empty state
		chainID := uint16(1)

		// Create mock repository that returns empty list
		repo := &mocks.AccountRepository{}
		repo.HashStateByChainIDResult = expectedHash

		useCase := NewGetAccountsHashStateUseCase(cfg, logger, repo)

		// Execute
		hash, err := useCase.Execute(context.Background(), chainID)

		// Assert
		assert.NoError(t, err)
		assert.Equal(t, expectedHash, hash)
	})
}
