// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/nameservice/usecase/faucet/getbychainid.go
package faucet

import (
	"context"
	"log/slog"

	"github.com/ethereum/go-ethereum/common"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/nameservice/domain/remoteaccountbalance"
)

type FetchRemoteAccountBalanceFromAuthorityUseCase interface {
	Execute(ctx context.Context, addr *common.Address) (*dom.RemoteAccountBalance, error)
}

type fetchRemoteAccountBalanceFromAuthorityImpl struct {
	logger *slog.Logger
	repo   dom.Repository
}

func NewFetchRemoteAccountBalanceFromAuthorityUseCase(
	logger *slog.Logger,
	repo dom.Repository,
) FetchRemoteAccountBalanceFromAuthorityUseCase {
	return &fetchRemoteAccountBalanceFromAuthorityImpl{logger, repo}
}

func (uc *fetchRemoteAccountBalanceFromAuthorityImpl) Execute(ctx context.Context, address *common.Address) (*dom.RemoteAccountBalance, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if address == nil {
		e["address"] = "Address is required"
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed validating",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Get from database.
	//

	return uc.repo.FetchFromAuthority(ctx, address)
}
