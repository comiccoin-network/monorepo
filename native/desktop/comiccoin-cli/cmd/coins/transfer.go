package coins

import (
	"context"
	"log"
	"log/slog"
	"strings"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/logger"
	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/security/securestring"
	"github.com/ethereum/go-ethereum/common"
	"github.com/spf13/cobra"

	"github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/repo"
)

// Command line argument flags
var (
	flagKeystoreFile          string // Location of the wallet keystore
	flagDataDir               string // Location of the database directory
	flagLabel                 string
	flagSenderAccountAddress  string
	flagSenderAccountMnemonic string
	flagSenderAccountPath     string
	flagCoinbaseAddress       string
	flagRecipientAddress      string
	flagQuantity              uint64
	flagKeypairName           string
	flagData                  string

	flagRendezvousString string
	flagBootstrapPeers   string
	flagListenAddresses  string

	flagListenHTTPPort       int
	flagListenHTTPIP         string
	flagListenPeerToPeerPort int

	flagListenHTTPAddress string

	flagIdentityKeyID string

	flagDataDirectory     string
	flagChainID           uint16
	flagAuthorityAddress  string
	flagNFTStorageAddress string
)

func TransferCoinsCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "transfer",
		Short: "Submit a (pending) transaction to the ComicCoin blockchain network to transfer coins from your account to another account",
		Run: func(cmd *cobra.Command, args []string) {
			doRunTransferCoinsCommand()
		},
	}

	cmd.Flags().StringVar(&flagDataDirectory, "data-directory", preferences.DataDirectory, "The data directory to save to")
	cmd.Flags().Uint16Var(&flagChainID, "chain-id", preferences.ChainID, "The blockchain to sync with")
	cmd.Flags().StringVar(&flagAuthorityAddress, "authority-address", preferences.AuthorityAddress, "The BlockChain authority address to connect to")
	cmd.Flags().StringVar(&flagNFTStorageAddress, "nftstorage-address", preferences.NFTStorageAddress, "The NFT storage service adress to connect to")

	cmd.Flags().StringVar(&flagSenderAccountAddress, "sender-account-address", "", "The address of the account we will use in our coin transfer")
	cmd.MarkFlagRequired("sender-account-address")

	cmd.Flags().StringVar(&flagSenderAccountMnemonic, "sender-account-mnemonic", "", "The mnemonic phrase to derive the account wallet which will transfer the coin")
	cmd.MarkFlagRequired("sender-account-mnemonic")

	cmd.Flags().StringVar(&flagSenderAccountPath, "sender-account-path", "", "The path to use when deriving the wallet from mnemonic phrase")
	cmd.MarkFlagRequired("sender-account-path")

	cmd.Flags().Uint64Var(&flagQuantity, "value", 0, "The amount of coins to send")
	cmd.MarkFlagRequired("value")

	cmd.Flags().StringVar(&flagData, "data", "", "Optional data to include with this transaction")

	cmd.Flags().StringVar(&flagRecipientAddress, "recipient-address", "", "The address of the account whom will receive this coin")
	cmd.MarkFlagRequired("recipient-address")

	return cmd
}

func doRunTransferCoinsCommand() {
	logger := logger.NewProvider()
	comicCoincRPCClientRepoConfigurationProvider := repo.NewComicCoincRPCClientRepoConfigurationProvider("localhost", "2233")
	rpcClient := repo.NewComicCoincRPCClientRepo(comicCoincRPCClientRepoConfigurationProvider, logger)

	// ------ Execute ------
	ctx := context.Background()
	recAddr := common.HexToAddress(strings.ToLower(flagRecipientAddress))
	sendAddr := common.HexToAddress(strings.ToLower(flagSenderAccountAddress))
	mnemonic, err := sstring.NewSecureString(flagSenderAccountMnemonic)
	if err != nil {
		log.Fatalf("Failed secure mnemonic: %v", err)
	}

	coinTransferServiceErr := rpcClient.CoinTransfer(
		ctx,
		flagChainID,
		&sendAddr,
		mnemonic,
		flagSenderAccountPath,
		&recAddr,
		flagQuantity, // A.k.a. `value`.
		[]byte(flagData),
	)
	if coinTransferServiceErr != nil {
		log.Fatalf("Failed execute coin transfer service: %v", coinTransferServiceErr)
	}

	logger.Info("Finished transfering coin(s) to another account",
		slog.Any("data-director", flagDataDirectory),
		slog.Any("chain-id", flagChainID),
		slog.Any("nftstorage-address", flagNFTStorageAddress),
		slog.Any("sender-account-address", flagSenderAccountAddress),
		slog.Any("sender-account-mnemonic", flagSenderAccountMnemonic),
		slog.Any("sender-account-path", flagSenderAccountPath),
		slog.Any("value", flagQuantity),
		slog.Any("data", flagData),
		slog.Any("recipient-address", flagRecipientAddress),
		slog.Any("authority-address", flagAuthorityAddress))
}
