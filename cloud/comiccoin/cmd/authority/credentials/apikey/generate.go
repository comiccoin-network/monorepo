package apikey

import (
	"log"
	"log/slog"

	"github.com/spf13/cobra"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	uc_apikey "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/apikey"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/logger"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/blacklist"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/jwt"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/password"
	sbytes "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/securebytes"
)

var (
	flagChainID             uint16
	flagHMACSecretKeyString string
)

func GenerateAPIKeyCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "generate",
		Short: "Commands used to create a new System Administrator API key for this service",
		Run: func(cmd *cobra.Command, args []string) {
			doGenerateAPIKeyCmd()
		},
	}

	cmd.Flags().Uint16Var(&flagChainID, "chain-id", 0, "The Chain ID to associate with this API key")
	cmd.MarkFlagRequired("chain-id")
	cmd.Flags().StringVar(&flagHMACSecretKeyString, "hmac-secret-key", "", "The HMAC secret key associated with this API to be generated")
	cmd.MarkFlagRequired("hmac-secret-key")

	return cmd
}

func doGenerateAPIKeyCmd() {
	//
	// STEP 1
	// Load up our dependencies and configuration
	//

	hmacSecretKeyBytes := []byte(flagHMACSecretKeyString)
	sb, err := sbytes.NewSecureBytes(hmacSecretKeyBytes)
	if err != nil {
		log.Fatalf("Environment variable failed to secure: %v", err)
	}

	// Manually set the configuration via the console input parameters.
	cfg := &config.Configuration{}
	cfg.App.AdministrationHMACSecret = sb

	logger := logger.NewProvider()
	passp := password.NewProvider()
	jwtp := jwt.NewProvider(cfg)
	blackp := blacklist.NewProvider()
	_ = blackp

	apiKeyGenUseCase := uc_apikey.NewGenerateAPIKeyUseCase(logger, passp, jwtp)

	//
	// STEP 2
	// Generate our applications credentials.
	//

	creds, err := apiKeyGenUseCase.Execute(flagChainID)
	if err != nil {
		log.Fatalf("Failed to generate API key: %v\n", err)
	}

	//
	// STEP 3
	// Print to console.
	//

	logger.Info("Credentials created",
		slog.Any("api-key", creds.APIKey),
		slog.Any("secret", creds.SecretString),
	)
}
