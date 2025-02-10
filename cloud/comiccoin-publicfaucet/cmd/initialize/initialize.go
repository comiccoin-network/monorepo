// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/cmd/initialize/initialize.go
package initialize

import (
	"log"
	"os"

	"github.com/spf13/cobra"
)

var (
	flagEmail    string
	flagPassword string
)

func InitCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "init",
		Short: "Initialize the application",
		Run: func(cmd *cobra.Command, args []string) {
			doRunPublicFaucetInit()
		},
	}
	cmd.Flags().StringVar(&flagEmail, "email", "", "The email of the administrator")
	cmd.MarkFlagRequired("email")
	cmd.Flags().StringVar(&flagPassword, "password", "", "The password of the administrators account")
	cmd.MarkFlagRequired("password")

	return cmd
}

func getEnv(key string, required bool) string {
	value := os.Getenv(key)
	if required && value == "" {
		log.Fatalf("Environment variable not found: %s", key)
	}
	return value
}

func doRunPublicFaucetInit() {
	//
	// STEP 1
	// Load up our dependencies and configuration
	//

	// TODO
}
