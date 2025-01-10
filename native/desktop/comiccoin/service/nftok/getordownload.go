package nftok

import (
	"context"
	"fmt"
	"log/slog"
	"math/big"
	"strings"

	auth_domain "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"

	"github.com/comiccoin-network/monorepo/native/desktop/comiccoin/domain"
	uc_nftok "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/usecase/nftok"
	uc_tok "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/usecase/tok"
)

type GetOrDownloadNonFungibleTokenService struct {
	logger                       *slog.Logger
	getNFTokUseCase              uc_nftok.GetNonFungibleTokenUseCase
	getTokUseCase                *uc_tok.GetTokenUseCase
	downloadNFTokMetadataUsecase uc_nftok.DownloadMetadataNonFungibleTokenUseCase
	downloadNFTokAssetUsecase    uc_nftok.DownloadNonFungibleTokenAssetUseCase
	upsertNFTokUseCase           uc_nftok.UpsertNonFungibleTokenUseCase
}

func NewGetOrDownloadNonFungibleTokenService(
	logger *slog.Logger,
	uc1 uc_nftok.GetNonFungibleTokenUseCase,
	uc2 *uc_tok.GetTokenUseCase,
	uc3 uc_nftok.DownloadMetadataNonFungibleTokenUseCase,
	uc4 uc_nftok.DownloadNonFungibleTokenAssetUseCase,
	uc5 uc_nftok.UpsertNonFungibleTokenUseCase,
) *GetOrDownloadNonFungibleTokenService {
	return &GetOrDownloadNonFungibleTokenService{logger, uc1, uc2, uc3, uc4, uc5}
}

func (s *GetOrDownloadNonFungibleTokenService) Execute(ctx context.Context, tokenID *big.Int, dirPath string) (*domain.NonFungibleToken, error) {
	//
	// STEP 1
	// Lookup our `token id` in our NFT db and if it exists we can return value.
	//

	nftok, err := s.getNFTokUseCase.Execute(ctx, tokenID)
	if err != nil {
		s.logger.Error("Failed getting non-fungible token.",
			slog.Any("tokenID", tokenID),
			slog.Any("error", err))
		return nil, err
	}
	if nftok != nil {
		return nftok, nil
	}

	//
	// STEP 2
	// Lookup our `token` in our db and retrieve the record so we can
	// extract the `Metadata URI` value necessary to lookup later in
	// the decentralized storage service (IPFS).
	//

	tok, err := s.getTokUseCase.Execute(ctx, tokenID)
	if err != nil {
		s.logger.Error("Failed getting token",
			slog.Any("tokenID", tokenID),
			slog.Any("error", err))
		return nil, fmt.Errorf("Failed getting token due to err: %v\n", err)
	}
	if tok == nil {
		s.logger.Error("Token does not exist.",
			slog.Any("tokenID", tokenID))
		return nil, fmt.Errorf("Token does not exist for: %v", tokenID)
	}

	// Confirm URI is using protocol our app supports.
	if strings.Contains(tok.MetadataURI, "ipfs://") == true {
		return s.getOrDownload(ctx, tok, dirPath)
	} else if strings.Contains(tok.MetadataURI, "https://") == true {
		return s.getOrDownload(ctx, tok, dirPath)
	}

	s.logger.Error("Token metadata URI contains protocol we do not support:",
		slog.Any("tokenID", tokenID),
		slog.Any("metadataURI", tok.MetadataURI))

	return nil, fmt.Errorf("Token metadata URI contains protocol we do not support: %v\n", tok.MetadataURI)
}

func (s *GetOrDownloadNonFungibleTokenService) getOrDownload(ctx context.Context, tok *auth_domain.Token, dirPath string) (*domain.NonFungibleToken, error) {
	metadataURI := tok.MetadataURI

	metadata, metadataFilepath, err := s.downloadNFTokMetadataUsecase.Execute(tok.GetID(), metadataURI, dirPath)
	if err != nil {
		s.logger.Error("Failed downloading nft metadata.",
			slog.Any("tokenID", tok.GetID()))
		return nil, fmt.Errorf("Failed downloading nft metadata: %v\n", err)
	}

	// Replace the IPFS path with our local systems filepath.
	metadataURI = metadataFilepath

	//
	// STEP 3
	// Create our NFT token to be referenced in future.
	//

	nftok := &domain.NonFungibleToken{
		TokenID:     tok.GetID(),
		MetadataURI: metadataURI,
		Metadata:    metadata,
		State:       domain.NonFungibleTokenStateNotReady,
	}

	if err := s.upsertNFTokUseCase.Execute(nftok); err != nil {
		s.logger.Error("Failed creating nft token.",
			slog.Any("tokenID", tok.GetID()))
		return nil, fmt.Errorf("Failed creating nft token: %v\n", err)
	}

	//
	// STEP 4
	// Download the image file from IPFS and save locally.
	//

	imageFilepath, err := s.downloadNFTokAssetUsecase.Execute(tok.GetID(), metadata.Image, dirPath)
	if err != nil {
		s.logger.Error("Failed downloading nft image asset.",
			slog.Any("tokenID", tok.GetID()),
			slog.Any("Image", metadata.Image),
			slog.Any("err", err))
		return nil, fmt.Errorf("Failed downloading nft image asset: %v\n", err)
	}

	// Replace the IPFS path with our local systems filepath.
	metadata.Image = imageFilepath

	//
	// STEP 5
	// Download the animation file from IPFS and save locally if this token has an animation included.
	//

	// Developers Note:
	// Why "8" because if we count "https://" string, there are 8 characters there.
	// Also "7" is count when "ipfs://".

	if metadata.AnimationURL != "" && len(metadata.AnimationURL) > 8 {
		animationFilepath, err := s.downloadNFTokAssetUsecase.Execute(tok.GetID(), metadata.AnimationURL, dirPath)
		if err != nil {
			s.logger.Error("Failed downloading nft animation asset.",
				slog.Any("tokenID", tok.GetID()),
				slog.Any("AnimationURL", metadata.AnimationURL),
				slog.Any("AnimationURL Length", len(metadata.AnimationURL)),
				slog.Any("err", err))
			return nil, fmt.Errorf("Failed downloading nft animation asset: %v\n", err)
		}

		// Replace the IPFS path with our local systems filepath.
		metadata.AnimationURL = animationFilepath
	}

	//
	// STEP 6
	// Update our NFT token to be referenced in future.
	//

	nftok = &domain.NonFungibleToken{
		TokenID:     tok.GetID(),
		MetadataURI: metadataURI,
		Metadata:    metadata,
		State:       domain.NonFungibleTokenStateReady,
	}

	if err := s.upsertNFTokUseCase.Execute(nftok); err != nil {
		s.logger.Error("Failed creating nft token.",
			slog.Any("tokenID", tok.GetID()))
		return nil, fmt.Errorf("Failed creating nft token: %v\n", err)
	}

	s.logger.Debug("Downloaded NFT successfully.",
		slog.Any("token_id", nftok.TokenID),
		slog.Any("metadata_uri", nftok.MetadataURI),
		slog.Any("MetadataURI", nftok.MetadataURI),
		slog.Any("Metadata.Image", nftok.Metadata.Image),
		slog.Any("Metadata.AnimationURL", nftok.Metadata.AnimationURL),
		slog.Any("Metadata.Name", nftok.Metadata.Name),
		slog.Any("Metadata.Description", nftok.Metadata.Description),
		slog.Any("Metadata.ExternalURL", nftok.Metadata.ExternalURL),
		slog.Any("Metadata.YoutubeURL", nftok.Metadata.YoutubeURL),
		slog.Any("Metadata.BackgroundColor", nftok.Metadata.BackgroundColor),
		slog.Any("Metadata.Attributes", nftok.Metadata.Attributes),
	)
	return nftok, nil
}
