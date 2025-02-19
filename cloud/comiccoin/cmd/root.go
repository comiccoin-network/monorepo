// github.com/comiccoin-network/monorepo/cloud/comiccoin/cmd/root.go
package cmd

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/cmd/authority"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/cmd/daemon"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/cmd/gateway"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/cmd/publicfaucet"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/cmd/version"
)

// Initialize function will be called when every command gets called.
func init() {

}

var rootCmd = &cobra.Command{
	Use:   "comiccoin",
	Short: "ComicCoin Authority",
	Long:  `ComicCoin Blockchain Authority`,
	Run: func(cmd *cobra.Command, args []string) {
		// Do nothing.
	},
}

func Execute() {
	// Attach sub-commands to our main root.
	rootCmd.AddCommand(gateway.GatewayCmd())
	rootCmd.AddCommand(authority.AuthorityCmd())
	rootCmd.AddCommand(publicfaucet.PublicFaucetCmd())
	rootCmd.AddCommand(daemon.DaemonCmd())
	rootCmd.AddCommand(version.VersionCmd())

	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
