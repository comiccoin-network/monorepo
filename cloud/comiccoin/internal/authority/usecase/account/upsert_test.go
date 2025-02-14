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
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/testutils/mocks"
)

func TestUpsertAccountUseCase_Execute(t *testing.T) {
	// Common setup
	cfg := &config.Configuration{
		Blockchain: config.BlockchainConfig{
			ChainID: 1,
		},
	}
	logger := slog.New(slog.NewTextHandler(io.Discard, nil))

	t.Run("validation fails - nil address", func(t *testing.T) {
		// Setup
		useCase := NewUpsertAccountUseCase(cfg, logger, &mocks.AccountRepository{})

		// Execute
		err := useCase.Execute(context.Background(), nil, 100, big.NewInt(1))

		// Assert
		assert.Error(t, err)
		var httpErr httperror.HTTPError
		assert.ErrorAs(t, err, &httpErr)
		assert.Equal(t, "missing value", (*httpErr.Errors)["address"])
	})

	t.Run("success - account upserted", func(t *testing.T) {
		// Setup
		address := common.HexToAddress("0x742d35Cc6634C0532925a3b844Bc454e4438f44e")
		balance := uint64(100)
		nonce := big.NewInt(1)
		repo := &mocks.AccountRepository{}
		useCase := NewUpsertAccountUseCase(cfg, logger, repo)

		// Execute
		err := useCase.Execute(context.Background(), &address, balance, nonce)

		// Assert
		assert.NoError(t, err)
	})

	t.Run("error - repository upsert fails", func(t *testing.T) {
		// Setup
		address := common.HexToAddress("0x742d35Cc6634C0532925a3b844Bc454e4438f44e")
		repo := &mocks.AccountRepository{
			UpsertErr: assert.AnError,
		}
		useCase := NewUpsertAccountUseCase(cfg, logger, repo)

		// Execute
		err := useCase.Execute(context.Background(), &address, 100, big.NewInt(1))

		// Assert
		assert.Error(t, err)
		assert.Equal(t, assert.AnError, err)
	})

	t.Run("success - zero balance", func(t *testing.T) {
		// Setup
		address := common.HexToAddress("0x742d35Cc6634C0532925a3b844Bc454e4438f44e")
		balance := uint64(0)
		nonce := big.NewInt(0)
		repo := &mocks.AccountRepository{}
		useCase := NewUpsertAccountUseCase(cfg, logger, repo)

		// Execute
		err := useCase.Execute(context.Background(), &address, balance, nonce)

		// Assert
		assert.NoError(t, err)
	})

	t.Run("success - large balance and nonce", func(t *testing.T) {
		// Setup
		address := common.HexToAddress("0x742d35Cc6634C0532925a3b844Bc454e4438f44e")
		balance := uint64(18446744073709551615)       // max uint64
		nonce := new(big.Int).Lsh(big.NewInt(1), 256) // large nonce
		repo := &mocks.AccountRepository{}
		useCase := NewUpsertAccountUseCase(cfg, logger, repo)

		// Execute
		err := useCase.Execute(context.Background(), &address, balance, nonce)

		// Assert
		assert.NoError(t, err)
	})
}
