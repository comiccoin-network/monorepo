package account

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"
	"github.com/ethereum/go-ethereum/common"
)

type GetAccountUseCase interface {
	Execute(ctx context.Context, address *common.Address) (*domain.Account, error)
}

type getAccountUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   domain.AccountRepository
}

func NewGetAccountUseCase(config *config.Configuration, logger *slog.Logger, repo domain.AccountRepository) GetAccountUseCase {
	return &getAccountUseCaseImpl{config, logger, repo}
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

	// uc.logger.Debug("Getting account...",
	// 	slog.Any("address", address))

	return uc.repo.GetByAddress(ctx, address)
}
