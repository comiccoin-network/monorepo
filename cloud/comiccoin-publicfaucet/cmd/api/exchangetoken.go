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
	r_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/repo/token"
	r_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/repo/user"
	svc_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/service/oauth"
	uc_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/oauth"
	uc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/token"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/user"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/storage/database/mongodb"
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
			ServerURL:         originalCfg.OAuth.ServerURL,
			ClientID:          originalCfg.OAuth.ClientID,
			ClientSecret:      originalCfg.OAuth.ClientSecret,
			ClientRedirectURI: originalCfg.OAuth.ClientRedirectURI,
			ClientSuccessURI:  originalCfg.OAuth.ClientSuccessURI,
			ClientCancelURI:   originalCfg.OAuth.ClientCancelURI,
		},
		DB: common_oauth_config.DBConfig{
			URI:  originalCfg.DB.URI,
			Name: originalCfg.DB.Name,
		},
	}
	logger.Debug("configuration ready")

	// Initialize MongoDB client
	mongoClient := mongodb.NewProvider(originalCfg, logger)
	defer func() {
		if err := mongoClient.Disconnect(context.Background()); err != nil {
			logger.Error("failed to disconnect from MongoDB", slog.Any("error", err))
		}
	}()

	// Initialize repositories
	oauthRepo := r_oauth.NewRepository(cfg, logger)
	userRepo := r_user.NewRepository(cfg, logger, mongoClient)
	tokenRepo := r_token.NewRepository(cfg, logger, mongoClient)

	// Initialize use cases
	exchangeCodeUseCase := uc_oauth.NewExchangeCodeUseCase(cfg, logger, oauthRepo)
	introspectTokenUseCase := uc_oauth.NewIntrospectTokenUseCase(cfg, logger, oauthRepo)
	userCreateUseCase := uc_user.NewUserCreateUseCase(cfg, logger, userRepo)
	userGetByEmailUseCase := uc_user.NewUserGetByEmailUseCase(cfg, logger, userRepo)
	tokenUpsertUseCase := uc_token.NewTokenUpsertByUserIDUseCase(cfg, logger, tokenRepo)

	// Initialize service
	exchangeService := svc_oauth.NewExchangeService(
		cfg,
		logger,
		exchangeCodeUseCase,
		introspectTokenUseCase,
		userCreateUseCase,
		userGetByEmailUseCase,
		tokenUpsertUseCase,
	)

	// Execute token exchange through the service
	resp, err := exchangeService.ExchangeToken(context.Background(), &svc_oauth.ExchangeTokenRequest{
		Code: authCode,
	})
	if err != nil {
		logger.Error("failed to exchange authorization code",
			slog.Any("error", err))
		log.Fatal(err)
	}

	// Print the token information
	fmt.Printf("\nToken Exchange Successful\n")
	fmt.Printf("Access Token: %s\n", resp.AccessToken)
	fmt.Printf("Refresh Token: %s\n", resp.RefreshToken)
	fmt.Printf("Token Type: %s\n", resp.TokenType)
	fmt.Printf("Expires In: %d seconds\n", resp.ExpiresIn)
	fmt.Printf("User Email: %s\n", resp.UserEmail) // Now we can show user info
	fmt.Printf("User Name: %s %s\n", resp.FirstName, resp.LastName)
}
