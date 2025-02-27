// github.com/comiccoin-network/monorepo/cloud/comiccoin/cmd/publicfauce/api/api.go
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
	cmd.AddCommand(RegisterCmd()) // Deprecated
	cmd.AddCommand(Register2Cmd())
	cmd.AddCommand(LoginCmd())
	cmd.AddCommand(TokenExchangeCmd())
	cmd.AddCommand(VerifyTokenCmd())
	cmd.AddCommand(RefreshTokenCmd())
	cmd.AddCommand(FetchProfileCmd())

	return cmd
}
