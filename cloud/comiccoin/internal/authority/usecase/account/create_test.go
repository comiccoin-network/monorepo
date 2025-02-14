package account

import (
	"context"
	"io"
	"log/slog"
	"testing"

	"github.com/ethereum/go-ethereum/common"
	"github.com/stretchr/testify/assert"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/testutils/mocks"
)

func TestCreateAccountUseCase_Execute(t *testing.T) {
	// Common setup with a no-op logger
	cfg := &config.Configuration{
		Blockchain: config.BlockchainConfig{
			ChainID: 1,
		},
	}
	logger := slog.New(slog.NewTextHandler(io.Discard, nil))

	t.Run("success case", func(t *testing.T) {
		// Setup
		address := common.HexToAddress("0x742d35Cc6634C0532925a3b844Bc454e4438f44e")
		useCase := NewCreateAccountUseCase(cfg, logger, &mocks.AccountRepository{})

		// Execute
		err := useCase.Execute(context.Background(), &address)

		// Assert
		assert.NoError(t, err)
	})

	t.Run("validation fails - nil address", func(t *testing.T) {
		useCase := NewCreateAccountUseCase(cfg, logger, &mocks.AccountRepository{})

		err := useCase.Execute(context.Background(), nil)

		assert.Error(t, err)
		// Optionally check for specific error type/message
		// assert.IsType(t, &httperror.BadRequest{}, err)
	})

	t.Run("repository error", func(t *testing.T) {
		// Setup with failing repository
		address := common.HexToAddress("0x742d35Cc6634C0532925a3b844Bc454e4438f44e")
		useCase := NewCreateAccountUseCase(cfg, logger, &mocks.AccountRepository{
			UpsertErr: assert.AnError,
		})

		// Execute
		err := useCase.Execute(context.Background(), &address)

		// Assert
		assert.Error(t, err)
		assert.Equal(t, assert.AnError, err)
	})
}
