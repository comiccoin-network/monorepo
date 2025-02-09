// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/cmd/api/token.go
package api

import (
	"context"
	"fmt"
	"log"
	"log/slog"

	"github.com/spf13/cobra"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/logger"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/config"
	r_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/repo/oauth"
	uc_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/usecase/oauth"
)

func TokenExchangeCmd() *cobra.Command {
	var authCode string

	var cmd = &cobra.Command{
		Use:   "exchange-token",
		Short: "Exchange authorization code for access token",
		Run: func(cmd *cobra.Command, args []string) {
			doRunTokenExchange(authCode)
		},
	}

	cmd.Flags().StringVarP(&authCode, "auth-code", "c", "", "Authorization code to exchange")
	cmd.MarkFlagRequired("auth-code")

	return cmd
}

func doRunTokenExchange(authCode string) {
	// Setup basic dependencies
	logger := logger.NewProvider()
	cfg := config.NewProviderUsingEnvironmentVariables()
	logger.Debug("configuration ready")

	// Initialize repositories and use cases
	oauthRepo := r_oauth.NewRepository(cfg, logger)
	exchangeCodeUseCase := uc_oauth.NewExchangeCodeUseCase(cfg, logger, oauthRepo)

	// Exchange code for token
	tokenResp, err := exchangeCodeUseCase.Execute(context.Background(), authCode)
	if err != nil {
		logger.Error("failed to exchange authorization code",
			slog.Any("error", err))
		log.Fatal(err)
	}

	// Print the token information
	fmt.Printf("\nToken Exchange Successful\n")
	fmt.Printf("Access Token: %s\n", tokenResp.AccessToken)
	fmt.Printf("Refresh Token: %s\n", tokenResp.RefreshToken)
	fmt.Printf("Token Type: %s\n", tokenResp.TokenType)
	fmt.Printf("Expires In: %d seconds\n", tokenResp.ExpiresIn)
}
