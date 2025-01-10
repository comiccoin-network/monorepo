package blockchainstatechangeeventdto

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"
)

type SubscribeToBlockchainStateChangeEventsFromBlockchainAuthorityUseCase interface {
	Execute(ctx context.Context, chainID uint16) (<-chan uint16, error)
}

type subscribeToBlockchainStateChangeEventsFromBlockchainAuthorityUseCaseImpl struct {
	logger *slog.Logger
	repo   domain.BlockchainStateChangeEventDTORepository
}

func NewSubscribeToBlockchainStateChangeEventsFromBlockchainAuthorityUseCase(
	logger *slog.Logger,
	repo domain.BlockchainStateChangeEventDTORepository,
) SubscribeToBlockchainStateChangeEventsFromBlockchainAuthorityUseCase {
	return &subscribeToBlockchainStateChangeEventsFromBlockchainAuthorityUseCaseImpl{logger, repo}
}

func (uc *subscribeToBlockchainStateChangeEventsFromBlockchainAuthorityUseCaseImpl) Execute(ctx context.Context, chainID uint16) (<-chan uint16, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if chainID == 0 {
		e["chain_id"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed getting blockchain state",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Insert into database.
	//

	return uc.repo.SubscribeToBlockchainAuthority(ctx, chainID)
}
