// github.com/comiccoin-network/monorepo/cloud/comiccoin/cmd/publicfaucet/publicfaucet.go
package publicfaucet

import (
	"github.com/spf13/cobra"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/cmd/publicfaucet/api"
)

func PublicFaucetCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "publicfaucet",
		Short: "Execute commands related to the public faucet",
		Run: func(cmd *cobra.Command, args []string) {
			// Do nothing...
		},
	}

	cmd.AddCommand(api.APICmd())

	return cmd
}
