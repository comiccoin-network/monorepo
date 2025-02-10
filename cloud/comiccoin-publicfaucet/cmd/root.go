// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/cmd/root.go
package cmd

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/cmd/api"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/cmd/daemon"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/cmd/initialize"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/cmd/user"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/cmd/version"
	// "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/cmd/user"
)

// Initialize function will be called when every command gets called.
func init() {

}

var rootCmd = &cobra.Command{
	Use:   "comiccoin-publicfaucet",
	Short: "ComicCoin PublicFaucet",
	Long:  ``,
	Run: func(cmd *cobra.Command, args []string) {
		// Do nothing.
	},
}

func Execute() {
	// Attach sub-commands to our main root.
	rootCmd.AddCommand(api.APICmd())
	rootCmd.AddCommand(daemon.DaemonCmd())
	rootCmd.AddCommand(version.VersionCmd())
	rootCmd.AddCommand(initialize.InitCmd())
	rootCmd.AddCommand(user.UserCmd())

	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
