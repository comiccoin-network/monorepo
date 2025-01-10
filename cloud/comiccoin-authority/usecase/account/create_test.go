package account

import (
	"context"
	"log/slog"
	"testing"

	"github.com/ethereum/go-ethereum/common"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"
)

// Approach 1: Mock all methods but keep implementation minimal
type MockAccountRepository struct {
	mock.Mock
}

// Implement the method we actually use
func (m *MockAccountRepository) Upsert(ctx context.Context, acc *domain.Account) error {
	args := m.Called(ctx, acc)
	return args.Error(0)
}

// Implement remaining methods with empty implementations
func (m *MockAccountRepository) GetByAddress(ctx context.Context, addr *common.Address) (*domain.Account, error) {
	return nil, nil
}

func (m *MockAccountRepository) ListByChainID(ctx context.Context, chainID uint16) ([]*domain.Account, error) {
	return nil, nil
}

func (m *MockAccountRepository) ListWithFilterByAddresses(ctx context.Context, addrs []*common.Address) ([]*domain.Account, error) {
	return nil, nil
}

func (m *MockAccountRepository) DeleteByAddress(ctx context.Context, addr *common.Address) error {
	return nil
}

func (m *MockAccountRepository) HashStateByChainID(ctx context.Context, chainID uint16) (string, error) {
	return "", nil
}

func (m *MockAccountRepository) OpenTransaction() error {
	return nil
}

func (m *MockAccountRepository) CommitTransaction() error {
	return nil
}

func (m *MockAccountRepository) DiscardTransaction() {
}

// Test helper function
func setupTest() (*CreateAccountUseCase, *MockAccountRepository) {
	mockRepo := new(MockAccountRepository)
	cfg := &config.Configuration{
		Blockchain: config.BlockchainConfig{
			ChainID: 1,
		},
	}
	logger := slog.Default()
	useCase := NewCreateAccountUseCase(cfg, logger, mockRepo)
	return useCase, mockRepo
}

func TestCreateAccountUseCase_Execute(t *testing.T) {
	t.Run("success case", func(t *testing.T) {
		useCase, mockRepo := setupTest()
		ctx := context.Background()
		address := common.HexToAddress("0x742d35Cc6634C0532925a3b844Bc454e4438f44e")

		// Only set expectations for methods we actually use
		mockRepo.On("Upsert", ctx, mock.MatchedBy(func(acc *domain.Account) bool {
			return acc.ChainID == 1 && acc.Address.Hex() == address.Hex()
		})).Return(nil)

		err := useCase.Execute(ctx, &address)

		assert.NoError(t, err)
		mockRepo.AssertExpectations(t)
	})

	t.Run("multiple upsert calls with different results", func(t *testing.T) {
		useCase, mockRepo := setupTest()
		ctx := context.Background()
		address1 := common.HexToAddress("0x742d35Cc6634C0532925a3b844Bc454e4438f44e")
		address2 := common.HexToAddress("0x842d35Cc6634C0532925a3b844Bc454e4438f44f")

		// Set up expectations for the first address
		mockRepo.On("Upsert", ctx, mock.MatchedBy(func(acc *domain.Account) bool {
			return acc.Address.Hex() == address1.Hex()
		})).Return(nil).Once()

		// Set up expectations for the second address
		mockRepo.On("Upsert", ctx, mock.MatchedBy(func(acc *domain.Account) bool {
			return acc.Address.Hex() == address2.Hex()
		})).Return(assert.AnError).Once()

		// First call should succeed
		err1 := useCase.Execute(ctx, &address1)
		assert.NoError(t, err1)

		// Second call should fail
		err2 := useCase.Execute(ctx, &address2)
		assert.Error(t, err2)

		mockRepo.AssertExpectations(t)
	})
}
