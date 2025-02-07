// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/cmd/clientdemo/clientdemo.go
package clientdemo

import "github.com/spf13/cobra"

func ClientDemoCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "clientdemo",
		Short: "Execute commands related to client demonstration apps",
		Run: func(cmd *cobra.Command, args []string) {
			// Do nothing...
		},
	}

	// // Attach our sub-commands for `account`
	cmd.AddCommand(AuthorizeCmd())
	cmd.AddCommand(ResourceCmd())

	return cmd
}
