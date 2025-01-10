package account

import (
	"context"
	"log/slog"
	"math/big"

	"github.com/ethereum/go-ethereum/common"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"
)

// CreateAccountUseCase defines the interface for creating blockchain accounts.
// This interface is used to decouple the implementation details from the business logic,
// making it easier to test and modify the implementation without affecting dependent code.
type CreateAccountUseCase interface {
	Execute(ctx context.Context, chainID uint16, address *common.Address) error
}

// createAccountUseCaseImpl implements the CreateAccountUseCase interface.
// It handles the creation of new blockchain accounts with validation and persistence.
type createAccountUseCaseImpl struct {
	logger *slog.Logger
	repo   domain.AccountRepository
}

func NewCreateAccountUseCase(logger *slog.Logger, repo domain.AccountRepository) CreateAccountUseCase {
	return &createAccountUseCaseImpl{logger, repo}
}

func (uc *createAccountUseCaseImpl) Execute(ctx context.Context, chainID uint16, address *common.Address) error {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if address == nil {
		e["address"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed creating new account",
			slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Create our structure.
	//

	account := &domain.Account{
		ChainID:    chainID,
		Address:    address,
		NonceBytes: big.NewInt(0).Bytes(),
		Balance:    0,
	}

	//
	// STEP 3: Insert into database.
	//

	return uc.repo.Upsert(ctx, account)
}
