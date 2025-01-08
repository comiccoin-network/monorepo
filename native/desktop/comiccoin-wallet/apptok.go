package main

import (
	"errors"
	"fmt"
	"log/slog"
	"math/big"
	"strings"

	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/security/securestring"
	"github.com/ethereum/go-ethereum/common"

	comic_domain "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/domain"
)

func (a *App) TransferToken(
	toRecipientAddress string,
	tokenID *big.Int,
	senderAccountAddress string,
	senderAccountPassword string,
) error {

	a.logger.Debug("Transfering token...",
		slog.Any("toRecipientAddress", toRecipientAddress),
		slog.Any("tokenID", tokenID),
		slog.Any("senderAccountAddress", senderAccountAddress),
		slog.Any("senderAccountPassword", senderAccountPassword),
	)

	var toRecipientAddr *common.Address = nil
	if toRecipientAddress != "" {
		to := common.HexToAddress(toRecipientAddress)
		toRecipientAddr = &to
	}

	var senderAccountAddr *common.Address = nil
	if senderAccountAddress != "" {
		sender := common.HexToAddress(senderAccountAddress)
		senderAccountAddr = &sender
	}

	password, err := sstring.NewSecureString(senderAccountPassword) //TODO: IMPL.
	if err != nil {
		a.logger.Error("Failed securing password",
			slog.Any("error", err))
		return err
	}
	// defer password.Wipe() // Developers Note: Commented out b/c they are causing problems with our app.

	tokenTransferErr := a.tokenTransferService.Execute(
		a.ctx,
		preferences.ChainID,
		senderAccountAddr,
		password,
		toRecipientAddr,
		tokenID,
	)
	if tokenTransferErr != nil {
		a.logger.Error("Failed transfering token",
			slog.Any("error", tokenTransferErr))
		return tokenTransferErr
	}

	return nil
}

func (a *App) GetNonFungibleTokensByOwnerAddress(address string) ([]*comic_domain.NonFungibleToken, error) {
	addr := common.HexToAddress(strings.ToLower(address))

	// Defensive code
	if address == "" {
		return make([]*comic_domain.NonFungibleToken, 0), fmt.Errorf("failed because: address is null: %v", address)
	}

	//
	// STEP 1:
	// Lookup all the tokens. Note: A token only has `token_id` and
	// `metadata_uri` fields - nothing else!
	//

	preferences := PreferencesInstance()
	dataDir := preferences.DataDirectory
	if dataDir == "" {
		dataDirDNEErr := errors.New("Data directory not set")
		return make([]*comic_domain.NonFungibleToken, 0), dataDirDNEErr
	}

	toks, err := a.listNonFungibleTokensByOwnerService.Execute(a.ctx, &addr, dataDir)
	if err != nil {
		a.logger.Error("Failed listing tokens by owner",
			slog.Any("error", err))
		return make([]*comic_domain.NonFungibleToken, 0), err
	}

	a.logger.Debug("",
		slog.Any("toks_count", len(toks)))

	return toks, nil
}

func (a *App) GetNonFungibleToken(tokenID *big.Int) (*comic_domain.NonFungibleToken, error) {
	preferences := PreferencesInstance()
	dataDir := preferences.DataDirectory
	if dataDir == "" {
		dataDirDNEErr := errors.New("Data directory not set")
		return nil, dataDirDNEErr
	}

	nftok, err := a.getOrDownloadNonFungibleTokenService.Execute(a.ctx, tokenID, dataDir)
	if err != nil {
		a.logger.Error("Failed getting non-fungible token by token ID.",
			slog.Any("error", err))
		return nil, err
	}
	if nftok == nil {
		err := fmt.Errorf("No nft returned for token ID: %v", tokenID)
		a.logger.Error("Failed getting non-fungible token by token ID.",
			slog.Any("error", err))
		return nil, err
	}

	a.logger.Debug("NFT",
		slog.Any("TokenID", nftok.TokenID),
		slog.Any("MetadataURI", nftok.MetadataURI),
		slog.Any("Metadata.Image", nftok.Metadata.Image),
		slog.Any("Metadata.AnimationURL", nftok.Metadata.AnimationURL),
		slog.Any("Metadata.Name", nftok.Metadata.Name),
		slog.Any("Metadata.Description", nftok.Metadata.Description),
		slog.Any("Metadata.ExternalURL", nftok.Metadata.ExternalURL),
		slog.Any("Metadata.YoutubeURL", nftok.Metadata.YoutubeURL),
		slog.Any("Metadata.BackgroundColor", nftok.Metadata.BackgroundColor),
		slog.Any("Metadata.Attributes", nftok.Metadata.Attributes),
		slog.Any("State", nftok.State))

	return nftok, nil
}

func (a *App) BurnToken(
	tokenID *big.Int,
	senderAccountAddress string,
	senderAccountPassword string,
) error {

	a.logger.Debug("Burning token...",
		slog.Any("tokenID", tokenID),
		slog.Any("senderAccountAddress", senderAccountAddress),
		slog.Any("senderAccountPassword", senderAccountPassword),
	)

	var senderAccountAddr *common.Address = nil
	if senderAccountAddress != "" {
		sender := common.HexToAddress(senderAccountAddress)
		senderAccountAddr = &sender
	}

	password, err := sstring.NewSecureString(senderAccountPassword)
	if err != nil {
		a.logger.Error("Failed securing password",
			slog.Any("error", err))
		return err
	}
	// defer password.Wipe() // Developers Note: Commented out b/c they are causing problems with our app.

	tokenBurnErr := a.tokenBurnService.Execute(
		a.ctx,
		preferences.ChainID,
		senderAccountAddr,
		password,
		tokenID,
	)
	if tokenBurnErr != nil {
		a.logger.Error("Failed burning token",
			slog.Any("error", tokenBurnErr))
		return tokenBurnErr
	}

	return nil
}
