// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/cmd/api/api.go
package api

import "github.com/spf13/cobra"

func APICmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "api",
		Short: "Execute commands related to application programming interface (API)",
		Run: func(cmd *cobra.Command, args []string) {
			// Do nothing...
		},
	}

	// Attach our sub-commands for `api`
	cmd.AddCommand(RegisterCmd())
	cmd.AddCommand(LoginCmd())
	cmd.AddCommand(TokenExchangeCmd())
	cmd.AddCommand(VerifyTokenCmd())
	cmd.AddCommand(RefreshTokenCmd())

	return cmd
}
