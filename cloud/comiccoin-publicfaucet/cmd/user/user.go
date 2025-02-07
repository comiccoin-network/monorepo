// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/cmd/user/user.go
package user

import "github.com/spf13/cobra"

func UserCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "user",
		Short: "Execute commands related to users",
		Run: func(cmd *cobra.Command, args []string) {
			// Do nothing...
		},
	}

	// // Attach our sub-commands for `account`
	cmd.AddCommand(NewCreateUserCmd())

	return cmd
}
