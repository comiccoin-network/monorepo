package mnemonic

import "github.com/spf13/cobra"

func MnemonicCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "mnemonic",
		Short: "Execute commands related to BIP39 mnemonic phrases used in wallets for the ComicCoin Authority web-service",
		Run: func(cmd *cobra.Command, args []string) {
			// Do nothing...
		},
	}

	// Attach our sub-commands for `apikey`
	cmd.AddCommand(GenerateMnemonicPhraseCmd())

	return cmd
}
