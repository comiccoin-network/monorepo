// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/cmd/api/register.go
package api

import (
	"context"
	"fmt"
	"log"
	"strings"

	"github.com/spf13/cobra"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/logger"
	common_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient"
	common_oauth_config "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/service/login"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/service/oauth"
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
			ServerURL:                originalCfg.OAuth.ServerURL,
			ClientID:                 originalCfg.OAuth.ClientID,
			ClientSecret:             originalCfg.OAuth.ClientSecret,
			ClientRedirectURI:        originalCfg.OAuth.ClientRedirectURI,
			ClientRegisterSuccessURI: originalCfg.OAuth.ClientRegisterSuccessURI,
			ClientRegisterCancelURI:  originalCfg.OAuth.ClientRegisterCancelURI,
			ClientAuthorizeOrLoginSuccessURI:    originalCfg.OAuth.ClientAuthorizeOrLoginSuccessURI,
			ClientAuthorizeOrLoginCancelURI:     originalCfg.OAuth.ClientAuthorizeOrLoginCancelURI,
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
			ServerURL:                cfg.OAuth.ServerURL,
			ClientID:                 cfg.OAuth.ClientID,
			ClientSecret:             cfg.OAuth.ClientSecret,
			ClientRedirectURI:        cfg.OAuth.ClientRedirectURI,
			ClientRegisterSuccessURI: cfg.OAuth.ClientRegisterSuccessURI,
			ClientRegisterCancelURI:  cfg.OAuth.ClientRegisterCancelURI,
			ClientAuthorizeOrLoginSuccessURI:    cfg.OAuth.ClientAuthorizeOrLoginSuccessURI,
			ClientAuthorizeOrLoginCancelURI:     cfg.OAuth.ClientAuthorizeOrLoginCancelURI,
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

	fmt.Printf("\nStarting OAuth 2.0 Authentication Process\n")
	fmt.Printf("----------------------------------------\n")
	fmt.Printf("This application uses OAuth 2.0's Authorization Code flow for secure authentication.\n")
	fmt.Printf("You'll be redirected to our secure login page where you can safely enter your credentials.\n")
	fmt.Printf("This ensures your password is never handled directly by this application.\n\n")

	// Create login request
	loginRequest := &login.LoginRequest{
		Email:    email,
		Password: password,
		AppID:    cfg.OAuth.ClientID,
		AuthFlow: "manual", // Using manual flow for better security
	}

	fmt.Printf("Initializing authentication request...\n")
	loginResponse, err := oauthClientManager.Login(ctx, loginRequest)
	if err != nil {
		fmt.Printf("\nAuthentication Error\n")
		fmt.Printf("-------------------\n")
		fmt.Printf("Failed to initialize login process: %v\n", err)
		fmt.Printf("If this error persists, please contact support.\n")
		log.Fatal("Login initialization failed")
	}
	if loginResponse == nil {
		fmt.Printf("\nSystem Error\n")
		fmt.Printf("------------\n")
		fmt.Printf("Received empty response from authentication server.\n")
		fmt.Printf("Please try again later or contact support if the issue persists.\n")
		log.Fatal("Empty login response")
	}

	// Replace internal Docker hostname with localhost
	authURL := strings.Replace(loginResponse.AuthCode,
		"http://comiccoin_network:8080",
		"http://localhost:8080", 1)

	fmt.Printf("\nAuthentication Required\n")
	fmt.Printf("----------------------\n")
	fmt.Printf("1. Your default web browser will open automatically to our secure login page.\n")
	fmt.Printf("2. After logging in, you'll be asked to authorize this application.\n")
	fmt.Printf("3. Once authorized, you'll be redirected to a page with an authorization code.\n")
	fmt.Printf("4. Copy the authorization code from the URL and paste it back here.\n\n")

	// // Open browser automatically
	// fmt.Printf("Opening browser for secure authentication...\n")
	// if err := openBrowser(authURL); err != nil {
	// 	fmt.Printf("\nCouldn't open browser automatically. Please copy and paste this URL manually:\n%s\n\n", authURL)
	// }
	fmt.Printf("\nPlease copy and paste this URL manually:\n%s\n\n", authURL)

	// Prompt for the authorization code
	fmt.Printf("\nAfter authorizing, please enter the code from the URL: ")
	var code string
	fmt.Scanln(&code)

	fmt.Printf("\nExchanging authorization code for access tokens...\n")
	exchangeRequest := &oauth.ExchangeTokenRequest{
		Code: code,
	}

	exchangeResponse, err := oauthClientManager.ExchangeToken(ctx, exchangeRequest)
	if err != nil {
		fmt.Printf("\nToken Exchange Error\n")
		fmt.Printf("-------------------\n")
		fmt.Printf("Failed to exchange authorization code: %v\n", err)
		fmt.Printf("This could happen if:\n")
		fmt.Printf("- The authorization code was entered incorrectly\n")
		fmt.Printf("- The code has expired (they're valid for a short time only)\n")
		fmt.Printf("- The authorization was denied\n\n")
		fmt.Printf("Please try the authentication process again.\n")
		log.Fatal("Token exchange failed")
	}

	fmt.Printf("\nAuthentication Successful!\n")
	fmt.Printf("------------------------\n")
	fmt.Printf("You've been securely authenticated using OAuth 2.0.\n\n")

	fmt.Printf("Session Details:\n")
	fmt.Printf("- Access Token: %s\n", exchangeResponse.AccessToken)
	fmt.Printf("- Refresh Token: %s\n", exchangeResponse.RefreshToken)
	fmt.Printf("- Token Type: %s\n", exchangeResponse.TokenType)
	fmt.Printf("- Expires In: %d seconds\n", exchangeResponse.ExpiresIn)
	fmt.Printf("- User: %s %s (%s)\n",
		exchangeResponse.FirstName,
		exchangeResponse.LastName,
		exchangeResponse.UserEmail)

	if loginResponse.HasOTPEnabled {
		fmt.Printf("\nTwo-Factor Authentication Status\n")
		fmt.Printf("------------------------------\n")
		fmt.Printf("2FA is enabled for your account (Validated: %v)\n",
			loginResponse.OTPValidated)
		fmt.Printf("This provides an extra layer of security for your account.\n")
	}

	fmt.Printf("\nYou can now use other commands that require authentication.\n")
	fmt.Printf("Your session will be automatically refreshed when needed.\n")
}

//
// func openBrowser(url string) error {
// 	var err error
// 	switch runtime.GOOS {
// 	case "linux":
// 		err = exec.Command("xdg-open", url).Start()
// 	case "windows":
// 		err = exec.Command("rundll32", "url.dll,FileProtocolHandler", url).Start()
// 	case "darwin":
// 		err = exec.Command("open", url).Start()
// 	default:
// 		err = fmt.Errorf("unsupported platform")
// 	}
// 	if err != nil {
// 		return fmt.Errorf("failed to open browser: %w", err)
// 	}
// 	return nil
// }
