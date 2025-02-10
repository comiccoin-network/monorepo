// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/cmd/api/exchangetoken.go
package api

import (
	"context"
	"fmt"
	"log"
	"log/slog"

	"github.com/spf13/cobra"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/logger"
	common_oauth_config "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/config"
	r_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/repo/oauth"
	uc_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/oauth"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/config"
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
	originalCfg := config.NewProviderUsingEnvironmentVariables()
	cfg := &common_oauth_config.Configuration{
		OAuth: common_oauth_config.OAuthConfig{
			ServerURL:    originalCfg.OAuth.ServerURL,
			ClientID:     originalCfg.OAuth.ClientID,
			ClientSecret: originalCfg.OAuth.ClientSecret,
			RedirectURI:  originalCfg.OAuth.RedirectURI,
		},
		DB: common_oauth_config.DBConfig{
			URI:  originalCfg.DB.URI,
			Name: originalCfg.DB.Name,
		},
	}
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
