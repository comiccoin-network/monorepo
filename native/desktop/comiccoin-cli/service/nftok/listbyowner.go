package nftok

import (
	"context"
	"log/slog"
	"math/big"

	"github.com/bartmika/arraydiff"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	auth_domain "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"
	"github.com/ethereum/go-ethereum/common"

	"github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/domain"
	uc_nftok "github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/usecase/nftok"
	uc_tok "github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/usecase/tok"
)

type ListNonFungibleTokensByOwnerService interface {
	Execute(ctx context.Context, address *common.Address, dirPath string) ([]*domain.NonFungibleToken, error)
}

type listNonFungibleTokensByOwnerServiceImpl struct {
	logger                                            *slog.Logger
	listTokensByOwnerUseCase                          uc_tok.ListTokensByOwnerUseCase
	listNonFungibleTokensWithFilterByTokenIDsyUseCase uc_nftok.ListNonFungibleTokensWithFilterByTokenIDsyUseCase

	// DEVELOPERS NOTE: This is not a mistake according to `Clean Architecture`, the service layer can communicate with other services.
	getOrDownloadNonFungibleTokenService GetOrDownloadNonFungibleTokenService
}

func NewListNonFungibleTokensByOwnerService(
	logger *slog.Logger,
	uc1 uc_tok.ListTokensByOwnerUseCase,
	uc2 uc_nftok.ListNonFungibleTokensWithFilterByTokenIDsyUseCase,
	s1 GetOrDownloadNonFungibleTokenService,
) ListNonFungibleTokensByOwnerService {
	return &listNonFungibleTokensByOwnerServiceImpl{logger, uc1, uc2, s1}
}

func (s *listNonFungibleTokensByOwnerServiceImpl) Execute(ctx context.Context, address *common.Address, dirPath string) ([]*domain.NonFungibleToken, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if address == nil {
		e["address"] = "missing value"
	}
	if len(e) != 0 {
		s.logger.Warn("Failed validating listing tokens by owner",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: List the tokens by owner and get the array of token IDs.
	//

	toks, err := s.listTokensByOwnerUseCase.Execute(ctx, address)
	if err != nil {
		s.logger.Error("Failed listing tokens by owner",
			slog.Any("error", err))
		return nil, err
	}

	tokIDs := auth_domain.ToTokenIDsArray(toks)

	s.logger.Debug("Fetched token list by owner",
		slog.Any("owner", address),
		slog.Any("tokIDs", tokIDs),
		slog.Any("toks", toks))

	//
	// STEP 3: Get all the NFTs we have in our database.
	//

	nftoks, err := s.listNonFungibleTokensWithFilterByTokenIDsyUseCase.Execute(ctx, tokIDs)
	if err != nil {
		s.logger.Error("Failed listing non-fungible tokens by toks",
			slog.Any("error", err))
		return nil, err
	}

	//
	// STEP 4
	// Compare the tokens we own with the non-fungible tokens we store and
	// download from the network any non-fungible tokens we are missing
	// that we own.
	//

	nftokIDs := domain.ToNonFungibleTokenIDsArray(nftoks)

	s.logger.Debug("Fetched non-fungible token list by token ids",
		slog.Any("tokIDs", tokIDs),
		slog.Any("nftokIDs", nftokIDs),
		slog.Any("nftoks", nftoks))

	// See what are the differences between the two arrays of type `uint64` data-types.
	_, _, missingInNFTokIDsArr := arraydiff.BigInts(tokIDs, nftokIDs)

	// s.logger.Debug("processing tokens...",
	// 	slog.Any("current_token_ids", tokIDs),
	// 	slog.Any("missing_nft_ids", missingInNFTokIDsArr))

	for _, missingTokID := range missingInNFTokIDsArr {
		if missingTokID.Cmp(big.NewInt(0)) != 0 { // Skip genesis token...
			s.logger.Debug("Getting or downloading non-fungible token...",
				slog.Any("missing_nft_id", missingTokID))

			nftok, err := s.getOrDownloadNonFungibleTokenService.Execute(ctx, missingTokID, dirPath)
			if err != nil {
				s.logger.Error("Failed getting or downloading token ID.",
					slog.Any("error", err))
				return nil, err
			}

			nftoks = append(nftoks, nftok)
		}
	}

	s.logger.Debug("Fetched non-fungible tokens",
		slog.Any("nftoks", nftoks))

	return nftoks, nil
}
