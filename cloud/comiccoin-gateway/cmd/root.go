// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/cmd/root.go
package cmd

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/cmd/application"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/cmd/clientdemo"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/cmd/daemon"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/cmd/initialize"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/cmd/user"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/cmd/version"
)

// Initialize function will be called when every command gets called.
func init() {

}

var rootCmd = &cobra.Command{
	Use:   "comiccoin-gateway",
	Short: "ComicCoin Gateway",
	Long:  ``,
	Run: func(cmd *cobra.Command, args []string) {
		// Do nothing.
	},
}

func Execute() {
	// Attach sub-commands to our main root.
	rootCmd.AddCommand(daemon.DaemonCmd())
	rootCmd.AddCommand(version.VersionCmd())
	rootCmd.AddCommand(initialize.InitCmd())
	rootCmd.AddCommand(clientdemo.ClientDemoCmd())
	rootCmd.AddCommand(application.ApplicationCmd())
	rootCmd.AddCommand(user.UserCmd())

	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
