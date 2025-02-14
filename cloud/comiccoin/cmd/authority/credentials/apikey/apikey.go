package apikey

import "github.com/spf13/cobra"

func APIKeyCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "apikey",
		Short: "Execute commands related to API key credentials on the ComicCoin Authority web-service",
		Run: func(cmd *cobra.Command, args []string) {
			// Do nothing...
		},
	}

	// Attach our sub-commands for `apikey`
	cmd.AddCommand(GenerateAPIKeyCmd())

	return cmd
}
