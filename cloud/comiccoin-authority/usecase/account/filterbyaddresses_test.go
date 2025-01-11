package account

import (
	"context"
	"io"
	"log/slog"
	"testing"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/testutils/mocks"
	"github.com/ethereum/go-ethereum/common"
	"github.com/stretchr/testify/assert"
)

func TestAccountsFilterByAddressesUseCase_Execute(t *testing.T) {
	// Common setup
	logger := slog.New(slog.NewTextHandler(io.Discard, nil))

	t.Run("validation fails with nil addresses", func(t *testing.T) {
		useCase := NewAccountsFilterByAddressesUseCase(logger, &mocks.AccountRepository{})
		accounts, err := useCase.Execute(context.Background(), nil)

		assert.Nil(t, accounts)
		assert.Error(t, err)
	})

	t.Run("validation fails with empty addresses array", func(t *testing.T) {
		useCase := NewAccountsFilterByAddressesUseCase(logger, &mocks.AccountRepository{})
		accounts, err := useCase.Execute(context.Background(), []*common.Address{})

		assert.Nil(t, accounts)
		assert.Error(t, err)
	})

	t.Run("success case", func(t *testing.T) {
		addr := common.HexToAddress("0x742d35Cc6634C0532925a3b844Bc454e4438f44e")
		expectedAccounts := []*domain.Account{{Address: &addr}}
		repo := &mocks.AccountRepository{
			FilterAccounts: expectedAccounts,
		}
		useCase := NewAccountsFilterByAddressesUseCase(logger, repo)

		accounts, err := useCase.Execute(context.Background(), []*common.Address{&addr})

		assert.NoError(t, err)
		assert.Equal(t, expectedAccounts, accounts)
	})

	t.Run("repository error", func(t *testing.T) {
		addr := common.HexToAddress("0x742d35Cc6634C0532925a3b844Bc454e4438f44e")
		repo := &mocks.AccountRepository{
			FilterErr: assert.AnError,
		}
		useCase := NewAccountsFilterByAddressesUseCase(logger, repo)

		accounts, err := useCase.Execute(context.Background(), []*common.Address{&addr})

		assert.Nil(t, accounts)
		assert.Error(t, err)
		assert.Equal(t, assert.AnError, err)
	})
}
