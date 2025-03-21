package account

import (
	"context"
	"io"
	"log/slog"
	"testing"

	"github.com/ethereum/go-ethereum/common"
	"github.com/stretchr/testify/assert"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/domain"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/testutils/mocks"
)

func TestGetAccountUseCase_Execute(t *testing.T) {

	// Common setup
	cfg := &config.Configuration{}
	logger := slog.New(slog.NewTextHandler(io.Discard, nil))

	t.Run("success case", func(t *testing.T) {
		// Setup
		address := common.HexToAddress("0x742d35Cc6634C0532925a3b844Bc454e4438f44e")
		expectedAccount := &domain.Account{Address: &address}
		repo := &mocks.AccountRepository{GetAccount: expectedAccount}
		useCase := NewGetAccountUseCase(cfg, logger, repo)

		// Execute
		account, err := useCase.Execute(context.Background(), &address)

		// Assert
		assert.NoError(t, err)
		assert.Equal(t, expectedAccount, account)
	})

	t.Run("validation fails - nil address", func(t *testing.T) {
		useCase := NewGetAccountUseCase(cfg, logger, &mocks.AccountRepository{})

		account, err := useCase.Execute(context.Background(), nil)

		assert.Nil(t, account)
		assert.Error(t, err)
	})

	t.Run("repository error", func(t *testing.T) {
		address := common.HexToAddress("0x742d35Cc6634C0532925a3b844Bc454e4438f44e")
		repo := &mocks.AccountRepository{
			GetErr: assert.AnError,
		}
		useCase := NewGetAccountUseCase(cfg, logger, repo)

		account, err := useCase.Execute(context.Background(), &address)

		assert.Nil(t, account)
		assert.Error(t, err)
		assert.Equal(t, assert.AnError, err)
	})
}
