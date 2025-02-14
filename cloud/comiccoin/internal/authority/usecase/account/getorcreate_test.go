package account

import (
	"context"
	"io"
	"log/slog"
	"math/big"
	"testing"

	"github.com/ethereum/go-ethereum/common"
	"github.com/stretchr/testify/assert"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/domain"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/testutils/mocks"
)

func TestGetOrCreateAccountUseCase_Execute(t *testing.T) {
	// Common setup
	cfg := &config.Configuration{
		Blockchain: config.BlockchainConfig{
			ChainID: 1,
		},
	}
	logger := slog.New(slog.NewTextHandler(io.Discard, nil))

	t.Run("validation fails - nil address", func(t *testing.T) {
		useCase := NewGetOrCreateAccountUseCase(cfg, logger, &mocks.AccountRepository{})

		err := useCase.Execute(context.Background(), nil, 100, big.NewInt(1))

		assert.Error(t, err)
		var httpErr httperror.HTTPError
		assert.ErrorAs(t, err, &httpErr)
		assert.Equal(t, "missing value", (*httpErr.Errors)["address"])
	})

	t.Run("success - account already exists", func(t *testing.T) {
		// Setup
		address := common.HexToAddress("0x742d35Cc6634C0532925a3b844Bc454e4438f44e")
		existingAccount := &domain.Account{
			ChainID: 1,
			Address: &address,
		}
		repo := &mocks.AccountRepository{
			GetAccount: existingAccount,
		}
		useCase := NewGetOrCreateAccountUseCase(cfg, logger, repo)

		// Execute
		err := useCase.Execute(context.Background(), &address, 100, big.NewInt(1))

		// Assert
		assert.NoError(t, err)
	})

	t.Run("success - create new account", func(t *testing.T) {
		// Setup
		address := common.HexToAddress("0x742d35Cc6634C0532925a3b844Bc454e4438f44e")
		balance := uint64(100)
		nonce := big.NewInt(1)
		repo := &mocks.AccountRepository{
			GetAccount: nil, // Simulate account not found
		}
		useCase := NewGetOrCreateAccountUseCase(cfg, logger, repo)

		// Execute
		err := useCase.Execute(context.Background(), &address, balance, nonce)

		// Assert
		assert.NoError(t, err)
	})

	t.Run("error - repository upsert fails", func(t *testing.T) {
		// Setup
		address := common.HexToAddress("0x742d35Cc6634C0532925a3b844Bc454e4438f44e")
		repo := &mocks.AccountRepository{
			GetAccount: nil,            // Simulate account not found
			UpsertErr:  assert.AnError, // Simulate upsert error
		}
		useCase := NewGetOrCreateAccountUseCase(cfg, logger, repo)

		// Execute
		err := useCase.Execute(context.Background(), &address, 100, big.NewInt(1))

		// Assert
		assert.Error(t, err)
		assert.Equal(t, assert.AnError, err)
	})
}
