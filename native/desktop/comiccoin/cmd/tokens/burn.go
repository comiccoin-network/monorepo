package tokens

import (
	"context"
	"log"
	"log/slog"
	"math/big"
	"strings"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/logger"
	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/security/securestring"
	"github.com/ethereum/go-ethereum/common"
	"github.com/spf13/cobra"

	"github.com/comiccoin-network/monorepo/native/desktop/comiccoin/repo"
)

func BurnTokensCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "burn",
		Short: "Submit a (pending) transaction to the ComicCoin blockchain network to transfer tokens from your account to another account",
		Run: func(cmd *cobra.Command, args []string) {
			doRunBurnTokensCommand()
		},
	}

	cmd.Flags().StringVar(&flagDataDirectory, "data-directory", preferences.DataDirectory, "The data directory to save to")
	cmd.Flags().Uint16Var(&flagChainID, "chain-id", preferences.ChainID, "The blockchain to sync with")
	cmd.Flags().StringVar(&flagAuthorityAddress, "authority-address", preferences.AuthorityAddress, "The BlockChain authority address to connect to")
	cmd.Flags().StringVar(&flagNFTStorageAddress, "nftstorage-address", preferences.NFTStorageAddress, "The NFT storage service adress to connect to")

	cmd.Flags().StringVar(&flagSenderAccountAddress, "sender-account-address", "", "The address of the account we will use in our token transfer")
	cmd.MarkFlagRequired("sender-account-address")

	cmd.Flags().StringVar(&flagSenderAccountMnemonic, "sender-account-mnemonic", "", "The mnemonic phrase to derive the account wallet which will transfer the coin")
	cmd.MarkFlagRequired("sender-account-mnemonic")

	cmd.Flags().StringVar(&flagSenderAccountPath, "sender-account-path", "", "The path to use when deriving the wallet from mnemonic phrase")
	cmd.MarkFlagRequired("sender-account-path")

	cmd.Flags().StringVar(&flagTokenID, "token-id", "", "The unique token identification to use to lookup the token")
	cmd.MarkFlagRequired("token-id")

	return cmd
}

func doRunBurnTokensCommand() {
	logger := logger.NewProvider()
	comicCoincRPCClientRepoConfigurationProvider := repo.NewComicCoincRPCClientRepoConfigurationProvider("localhost", "2233")
	rpcClient := repo.NewComicCoincRPCClientRepo(comicCoincRPCClientRepoConfigurationProvider, logger)

	// ------ Execute ------
	ctx := context.Background()
	sendAddr := common.HexToAddress(strings.ToLower(flagSenderAccountAddress))
	tokenID, ok := new(big.Int).SetString(flagTokenID, 10)
	if !ok {
		log.Fatal("Failed convert `token_id` to big.Int")
	}
	mnemonic, err := sstring.NewSecureString(flagSenderAccountMnemonic)
	if err != nil {
		log.Fatalf("Failed secure mnemonic: %v", err)
	}

	logger.Debug("Transfering Token...",
		slog.Any("token_id", tokenID))

	tokenBurnServiceErr := rpcClient.TokenBurn(
		ctx,
		flagChainID,
		&sendAddr,
		mnemonic,
		flagSenderAccountPath,
		tokenID,
	)
	if tokenBurnServiceErr != nil {
		log.Fatalf("Failed execute token transfer service: %v", tokenBurnServiceErr)
	}

	logger.Info("Finished burning token",
		slog.Any("data-director", flagDataDirectory),
		slog.Any("chain-id", flagChainID),
		slog.Any("nftstorage-address", flagNFTStorageAddress),
		slog.Any("sender-account-address", flagSenderAccountAddress),
		slog.Any("sender-account-mnemonic", flagSenderAccountMnemonic),
		slog.Any("sender-account-path", flagSenderAccountPath),
		slog.Any("token-id", flagTokenID),
		slog.Any("recipient-address", flagRecipientAddress),
		slog.Any("authority-address", flagAuthorityAddress))
}
