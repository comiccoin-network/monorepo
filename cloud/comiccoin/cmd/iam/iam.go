// github.com/comiccoin-network/monorepo/cloud/comiccoin/cmd/iam/iam.go
package iam

import (
	"github.com/spf13/cobra"
)

func IAMCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "iam",
		Short: "Execute commands related to identity and access management",
		Run: func(cmd *cobra.Command, args []string) {
			// Do nothing...
		},
	}

	// Add IAM-related commands
	cmd.AddCommand(GetCreateAdminUserCmd())

	return cmd
}
