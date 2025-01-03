package credentials

import (
	"github.com/spf13/cobra"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/cmd/credentials/apikey"
)

func CredentialsCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "credentials",
		Short: "Execute commands related to credentials on the ComicCoin Authority web-service",
		Run: func(cmd *cobra.Command, args []string) {
			// Do nothing...
		},
	}

	// Attach our sub-commands for `credentials`
	cmd.AddCommand(apikey.APIKeyCmd())

	return cmd
}
