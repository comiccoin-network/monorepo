// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/cmd/federatedidentity/federatedidentity.go
package federatedidentity

import "github.com/spf13/cobra"

func FederatedIdentityCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "federatedidentity",
		Short: "Execute commands related to federatedidentitys",
		Run: func(cmd *cobra.Command, args []string) {
			// Do nothing...
		},
	}

	// // Attach our sub-commands for `account`
	cmd.AddCommand(NewCreateFederatedIdentityCmd())

	return cmd
}
