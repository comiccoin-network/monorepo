package blocktx

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	"github.com/ethereum/go-ethereum/common"

	"github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/domain"
)

type SubscribeToGetLatestBlockTransactionByAddressServerSentEventsFromBlockchainAuthorityUseCase interface {
	Execute(ctx context.Context, address *common.Address) (<-chan string, error)
}

type subscribeToGetLatestBlockTransactionByAddressServerSentEventsFromBlockchainAuthorityUseCaseImpl struct {
	logger *slog.Logger
	repo   domain.GetLatestBlockTransactionByAddressServerSentEventsDTORepository
}

func NewSubscribeToGetLatestBlockTransactionByAddressServerSentEventsFromBlockchainAuthorityUseCase(
	logger *slog.Logger,
	repo domain.GetLatestBlockTransactionByAddressServerSentEventsDTORepository,
) SubscribeToGetLatestBlockTransactionByAddressServerSentEventsFromBlockchainAuthorityUseCase {
	return &subscribeToGetLatestBlockTransactionByAddressServerSentEventsFromBlockchainAuthorityUseCaseImpl{logger, repo}
}

func (uc *subscribeToGetLatestBlockTransactionByAddressServerSentEventsFromBlockchainAuthorityUseCaseImpl) Execute(ctx context.Context, address *common.Address) (<-chan string, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if address == nil {
		e["address"] = "missing value"
	} else {
		if address.String() == "" {
			e["address"] = "missing value"
		}
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed validating",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Insert into database.
	//

	return uc.repo.SubscribeToBlockchainAuthority(ctx, address)
}
