package account

import (
	"context"
	"log/slog"
	"math/big"

	"github.com/ethereum/go-ethereum/common"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/domain"
)

// CreateAccountUseCase defines the interface for creating blockchain accounts.
// This interface is used to decouple the implementation details from the business logic,
// making it easier to test and modify the implementation without affecting dependent code.
type CreateAccountUseCase interface {
	Execute(ctx context.Context, address *common.Address) error
}

// createAccountUseCaseImpl implements the CreateAccountUseCase interface.
// It handles the creation of new blockchain accounts with validation and persistence.
type createAccountUseCaseImpl struct {
	config *config.Configuration    // Application configuration
	logger *slog.Logger             // Structured logger for operation logging
	repo   domain.AccountRepository // Repository for account persistence
}

// NewCreateAccountUseCase creates a new instance of CreateAccountUseCase.
// It follows the factory pattern to ensure proper initialization of the implementation.
//
// Parameters:
//   - config: Application configuration containing blockchain settings
//   - logger: Structured logger for operation logging
//   - repo: Repository interface for account persistence
//
// Returns:
//   - CreateAccountUseCase: Interface for creating accounts
func NewCreateAccountUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo domain.AccountRepository,
) CreateAccountUseCase {
	return &createAccountUseCaseImpl{config, logger, repo}
}

// Execute creates a new blockchain account with the provided address.
// It performs validation, creates the account structure, and persists it to storage.
//
// Parameters:
//   - ctx: Context for the operation, which can be used for cancellation
//   - address: Ethereum address for the new account
//
// Returns:
//   - error: nil if successful, httperror.BadRequest for validation failures,
//     or any other error encountered during persistence
//
// Note: The nonce is initialized to 0 and stored as bytes. The nonce is used to
// prevent transaction replay attacks in the blockchain.
func (uc *createAccountUseCaseImpl) Execute(ctx context.Context, address *common.Address) error {
	// Validate required fields
	e := make(map[string]string)
	if address == nil {
		e["address"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed creating new account",
			slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	// Create the account structure with initial values
	// Balance starts at 0 and nonce is initialized to prevent replay attacks
	account := &domain.Account{
		ChainID:    uc.config.Blockchain.ChainID,
		Address:    address,
		NonceBytes: big.NewInt(0).Bytes(),
		Balance:    0,
	}

	// Persist the account to storage
	// Upsert will create a new account or update an existing one
	return uc.repo.Upsert(ctx, account)
}
