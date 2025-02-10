// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/cmd/api/register.go
package api

import (
	"context"
	"fmt"
	"log"

	"github.com/spf13/cobra"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/logger"
	common_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient"
	common_oauth_config "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/service/login"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/storage/database/mongodb"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/storage/database/mongodbcache"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/config"
)

func LoginCmd() *cobra.Command {
	var email, firstName, lastName, phone, country, timezone, password string
	var agreeTOS bool

	var cmd = &cobra.Command{
		Use:   "login",
		Short: "Log in user",
		Long:  `Logs user in the system with OAuth 2.0 client account`,
		Run: func(cmd *cobra.Command, args []string) {
			doRunLoginCmd(email, firstName, lastName, phone, country, timezone, password, agreeTOS)
		},
	}

	// Required flags
	cmd.Flags().StringVarP(&email, "email", "e", "", "User's email address")
	cmd.Flags().StringVarP(&firstName, "password", "p", "", "User's password")

	// Mark required flags
	cmd.MarkFlagRequired("email")
	cmd.MarkFlagRequired("password")

	return cmd
}

func doRunLoginCmd(email, firstName, lastName, phone, country, timezone, password string, agreeTOS bool) {
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
	dbClient := mongodb.NewProvider(originalCfg, logger)
	cache := mongodbcache.NewCache(originalCfg, logger, dbClient)

	// Initialize context
	ctx := context.Background()

	defer dbClient.Disconnect(ctx)
	// defer cache.Disconnect(ctx)

	oauthClientConfig := &common_oauth_config.Configuration{
		OAuth: common_oauth_config.OAuthConfig{
			ServerURL:    cfg.OAuth.ServerURL,
			ClientID:     cfg.OAuth.ClientID,
			ClientSecret: cfg.OAuth.ClientSecret,
			RedirectURI:  cfg.OAuth.RedirectURI,
		},
		DB: common_oauth_config.DBConfig{
			URI:  cfg.DB.URI,
			Name: cfg.DB.Name,
		},
	}

	// Initialize OAuth manager
	oauthClientManager, err := common_oauth.NewManager(ctx, oauthClientConfig, logger, cache, dbClient)
	if err != nil {
		log.Fatalf("Failed to load up our oAuth 2.0 Client manager")
	}

	// Create login request
	loginRequest := &login.LoginRequest{
		Email:    email,
		Password: password,
		AppID:    cfg.OAuth.ClientID,
		AuthFlow: "password", // Use password grant type for CLI
	}

	loginResponse, err := oauthClientManager.Login(ctx, loginRequest)
	if err != nil {
		log.Fatalf("Failed logging in with error: %v\n", err)
	}
	if loginResponse == nil {
		log.Fatalf("Failed logging in with empty response for login request: %v\n", loginRequest)
	}

	fmt.Println("AuthCode:", loginResponse.AuthCode)
	fmt.Println("RedirectURI:", loginResponse.RedirectURI)
	fmt.Println("AccessToken:", loginResponse.AccessToken)
	fmt.Println("RefreshToken:", loginResponse.RefreshToken)
	fmt.Println("TokenType:", loginResponse.TokenType)
	fmt.Println("ExpiresIn:", loginResponse.ExpiresIn)
	fmt.Println("HasOTPEnabled:", loginResponse.HasOTPEnabled)
	fmt.Println("OTPValidated:", loginResponse.OTPValidated)
}
