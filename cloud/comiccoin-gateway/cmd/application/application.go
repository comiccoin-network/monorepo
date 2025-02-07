// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/cmd/account/account.go
package application

import "github.com/spf13/cobra"

func ApplicationCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "application",
		Short: "Execute commands related to applications",
		Run: func(cmd *cobra.Command, args []string) {
			// Do nothing...
		},
	}

	// // Attach our sub-commands for `account`
	cmd.AddCommand(NewCreateApplicationCmd())

	return cmd
}
