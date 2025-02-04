package blockchainstatesse

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/domain"
)

type SubscribeToBlockchainStateServerSentEventsFromBlockchainAuthorityUseCase interface {
	Execute(ctx context.Context, chainID uint16) (<-chan string, error)
}

//
// Copied from `github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase`
//

type subscribeToBlockchainStateServerSentEventsFromBlockchainAuthorityUseCaseImpl struct {
	logger *slog.Logger
	repo   domain.BlockchainStateServerSentEventsDTORepository
}

func NewSubscribeToBlockchainStateServerSentEventsFromBlockchainAuthorityUseCase(
	logger *slog.Logger,
	repo domain.BlockchainStateServerSentEventsDTORepository,
) SubscribeToBlockchainStateServerSentEventsFromBlockchainAuthorityUseCase {
	return &subscribeToBlockchainStateServerSentEventsFromBlockchainAuthorityUseCaseImpl{logger, repo}
}

func (uc *subscribeToBlockchainStateServerSentEventsFromBlockchainAuthorityUseCaseImpl) Execute(ctx context.Context, chainID uint16) (<-chan string, error) {
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
