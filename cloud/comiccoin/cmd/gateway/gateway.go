package gateway

import (
	"github.com/spf13/cobra"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/cmd/gateway/application"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/cmd/gateway/federatedidentity"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/cmd/gateway/initialize"
)

func GatewayCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "gateway",
		Short: "Execute commands related to the gateway",
		Run: func(cmd *cobra.Command, args []string) {
			// Do nothing...
		},
	}

	// Attach sub-commands to our main root.
	cmd.AddCommand(initialize.InitCmd())
	cmd.AddCommand(federatedidentity.FederatedIdentityCmd())
	cmd.AddCommand(application.ApplicationCmd())

	return cmd
}
