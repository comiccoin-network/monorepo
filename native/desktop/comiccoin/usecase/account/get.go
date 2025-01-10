package account

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"
	"github.com/ethereum/go-ethereum/common"
)

type GetAccountUseCase interface {
	Execute(ctx context.Context, address *common.Address) (*domain.Account, error)
}

type getAccountUseCaseImpl struct {
	logger *slog.Logger
	repo   domain.AccountRepository
}

func NewGetAccountUseCase(logger *slog.Logger, repo domain.AccountRepository) GetAccountUseCase {
	return &getAccountUseCaseImpl{logger, repo}
}

func (uc *getAccountUseCaseImpl) Execute(ctx context.Context, address *common.Address) (*domain.Account, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if address == nil {
		e["address"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed getting account",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Insert into database.
	//

	return uc.repo.GetByAddress(ctx, address)
}
