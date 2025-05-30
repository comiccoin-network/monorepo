package account

import (
	"context"
	"log/slog"
	"math/big"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/domain"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/ethereum/go-ethereum/common"
)

type GetOrCreateAccountUseCase interface {
	Execute(ctx context.Context, walletAddress *common.Address, balance uint64, nonce *big.Int) error
}

type getOrCreateAccountUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   domain.AccountRepository
}

func NewGetOrCreateAccountUseCase(config *config.Configuration, logger *slog.Logger, repo domain.AccountRepository) GetOrCreateAccountUseCase {
	return &getOrCreateAccountUseCaseImpl{config, logger, repo}
}

func (uc *getOrCreateAccountUseCaseImpl) Execute(ctx context.Context, walletAddress *common.Address, balance uint64, nonce *big.Int) error {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if walletAddress == nil {
		e["address"] = "missing value"
	}
	if len(e) != 0 {
		// uc.logger.Warn("Validation failed for upsert",
		// 	slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Attempt to get from database.
	//

	// Skip error handling
	getAcc, _ := uc.repo.GetByAddress(ctx, walletAddress)
	if getAcc != nil {
		return nil
	}

	//
	// STEP 2: Create our record and save to database.
	//

	account := &domain.Account{
		ChainID:    uc.config.Blockchain.ChainID,
		Address:    walletAddress,
		NonceBytes: nonce.Bytes(),
		Balance:    balance,
	}

	return uc.repo.Upsert(ctx, account)
}
