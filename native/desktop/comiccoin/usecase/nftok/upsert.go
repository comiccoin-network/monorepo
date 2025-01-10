package nftok

import (
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"

	"github.com/comiccoin-network/monorepo/native/desktop/comiccoin/domain"
)

type UpsertNonFungibleTokenUseCase interface {
	Execute(nftok *domain.NonFungibleToken) error
}

type upsertNonFungibleTokenUseCaseImpl struct {
	logger *slog.Logger
	repo   domain.NonFungibleTokenRepository
}

func NewUpsertNonFungibleTokenUseCase(logger *slog.Logger, repo domain.NonFungibleTokenRepository) UpsertNonFungibleTokenUseCase {
	return &upsertNonFungibleTokenUseCaseImpl{logger, repo}
}

func (uc *upsertNonFungibleTokenUseCaseImpl) Execute(nftok *domain.NonFungibleToken) error {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if nftok == nil {
		e["nftok"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed creating non-fungible token because validation failed",
			slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Insert into database.
	//

	return uc.repo.Upsert(nftok)
}
