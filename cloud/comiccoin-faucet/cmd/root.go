package cmd

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/cmd/account"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/cmd/daemon"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/cmd/initialize"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/cmd/version"
)

// Initialize function will be called when every command gets called.
func init() {

}

var rootCmd = &cobra.Command{
	Use:   "comiccoin-faucet",
	Short: "ComicCoin Faucet",
	Long:  ``,
	Run: func(cmd *cobra.Command, args []string) {
		// Do nothing.
	},
}

func Execute() {
	// Attach sub-commands to our main root.
	rootCmd.AddCommand(account.AccountCmd())
	rootCmd.AddCommand(daemon.DaemonCmd())
	rootCmd.AddCommand(version.VersionCmd())
	rootCmd.AddCommand(initialize.InitCmd())

	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
