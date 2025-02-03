package account

import (
	"context"
	"log"
	"log/slog"
	"strings"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/logger"
	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/security/securestring"
	"github.com/spf13/cobra"

	"github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/repo"
)

var (
	flagDataDirectory string
	flagChainID       uint16
	flagLabel         string
	flagMnemonic      string
	flagPath          string
	flagPassword      string
)

func NewAccountCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "new",
		Short: "Creates a new wallet in your local filesystem and encrypts it using the inputted password for security",
		Run: func(cmd *cobra.Command, args []string) {
			if err := doRunNewAccountCmd(); err != nil {
				log.Fatal(err)
			}
		},
	}

	cmd.Flags().StringVar(&flagDataDirectory, "data-directory", preferences.DataDirectory, "The data directory to save to")
	cmd.Flags().Uint16Var(&flagChainID, "chain-id", preferences.ChainID, "The ChainID to use")
	cmd.MarkFlagRequired("chain-id")
	cmd.Flags().StringVar(&flagMnemonic, "wallet-mnemonic", "", "The mnemonic phrase to derive the wallet with")
	cmd.MarkFlagRequired("wallet-mnemonic")
	cmd.Flags().StringVar(&flagPath, "wallet-path", "", "The path to use when deriving the wallet from the mnemonic phrase")
	cmd.MarkFlagRequired("wallet-path")
	cmd.Flags().StringVar(&flagLabel, "wallet-label", "", "The (optional) label to describe the new wallet with")
	cmd.MarkFlagRequired("wallet-label")
	cmd.Flags().StringVar(&flagPassword, "wallet-password", "", "The password to encrypt the wallet at rest with")
	cmd.MarkFlagRequired("wallet-password")

	return cmd
}

func doRunNewAccountCmd() error {
	logger := logger.NewProvider()

	// logger := logger.NewProvider()
	logger.Debug("Creating new account...",
		slog.Any("chain_id", flagChainID),
		slog.Any("wallet_mnemonic", flagMnemonic),
		slog.Any("wallet_path", flagPath),
		slog.Any("wallet_label", flagLabel),
	)

	comicCoincRPCClientRepoConfigurationProvider := repo.NewComicCoincRPCClientRepoConfigurationProvider("localhost", "2233")
	rpcClient := repo.NewComicCoincRPCClientRepo(comicCoincRPCClientRepoConfigurationProvider, logger)

	ctx := context.Background()
	mnemonic, err := sstring.NewSecureString(flagMnemonic)
	if err != nil {
		log.Fatalf("Failed secure mnemonic phrase: %v", err)
	}
	pass, err := sstring.NewSecureString(flagPassword)
	if err != nil {
		log.Fatalf("Failed secure password: %v", err)
	}

	account, err := rpcClient.CreateAccount(ctx, flagChainID, mnemonic, flagPath, pass, flagLabel)
	if err != nil {
		log.Fatalf("Failed creating account: %v\n", err)
	}
	logger.Info("Account created",
		slog.Any("chain-id", flagChainID),
		slog.Any("nonce", account.GetNonce()),
		slog.Uint64("balance", account.Balance),
		slog.String("address", strings.ToLower(account.Address.Hex())),
	)

	return nil
}
