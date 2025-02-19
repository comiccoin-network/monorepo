// github.com/comiccoin-network/monorepo/cloud/comiccoin/cmd/publicfaucet/api/register2.go
package api

import (
	"context"
	"fmt"
	"log"

	"github.com/spf13/cobra"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/logger"
	common_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient"
	common_oauth_config "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/storage/database/mongodb"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/storage/database/mongodbcache"
)

func Register2Cmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "register2",
		Short: "Generates a oAuth 2.0 registration URL",
		Long:  `Register a new federatedidentity in the system with OAuth 2.0 client registration`,
		Run: func(cmd *cobra.Command, args []string) {
			// Setup basic dependencies
			ctx := context.Background()
			logger := logger.NewProvider()
			originalCfg := config.NewProvider()
			cfg := &common_oauth_config.Configuration{
				OAuth: common_oauth_config.OAuthConfig{
					ServerURL:                        originalCfg.PublicFaucetOAuth.ServerURL,
					ClientID:                         originalCfg.PublicFaucetOAuth.ClientID,
					ClientSecret:                     originalCfg.PublicFaucetOAuth.ClientSecret,
					ClientRedirectURI:                originalCfg.PublicFaucetOAuth.ClientRedirectURI,
					ClientRegisterSuccessURI:         originalCfg.PublicFaucetOAuth.ClientRegisterSuccessURI,
					ClientRegisterCancelURI:          originalCfg.PublicFaucetOAuth.ClientRegisterCancelURI,
					ClientAuthorizeOrLoginSuccessURI: originalCfg.PublicFaucetOAuth.ClientAuthorizeOrLoginSuccessURI,
					ClientAuthorizeOrLoginCancelURI:  originalCfg.PublicFaucetOAuth.ClientAuthorizeOrLoginCancelURI,
				},
				DB: common_oauth_config.DBConfig{
					URI:  originalCfg.DB.URI,
					Name: originalCfg.DB.PublicFaucetName,
				},
			}
			logger.Debug("configuration ready")
			dbClient := mongodb.NewProvider(originalCfg, logger)
			defer dbClient.Disconnect(ctx)
			cacheConfigurationProvider := mongodbcache.NewCacheConfigurationProvider(originalCfg.DB.PublicFaucetName)
			cache := mongodbcache.NewCache(cacheConfigurationProvider, logger, dbClient)

			// Initialize OAuth manager
			oauthClientConfig := &common_oauth_config.Configuration{
				OAuth: common_oauth_config.OAuthConfig{
					ServerURL:                        cfg.OAuth.ServerURL,
					ClientID:                         cfg.OAuth.ClientID,
					ClientSecret:                     cfg.OAuth.ClientSecret,
					ClientRedirectURI:                cfg.OAuth.ClientRedirectURI,
					ClientRegisterSuccessURI:         cfg.OAuth.ClientRegisterSuccessURI,
					ClientRegisterCancelURI:          cfg.OAuth.ClientRegisterCancelURI,
					ClientAuthorizeOrLoginSuccessURI: cfg.OAuth.ClientAuthorizeOrLoginSuccessURI,
					ClientAuthorizeOrLoginCancelURI:  cfg.OAuth.ClientAuthorizeOrLoginCancelURI,
				},
				DB: common_oauth_config.DBConfig{
					URI:  cfg.DB.URI,
					Name: cfg.DB.Name,
				},
			}
			oauthClientManager, err := common_oauth.NewManager(ctx, oauthClientConfig, logger, cache, dbClient)
			if err != nil {
				log.Fatalf("Failed to load up our oAuth 2.0 Client manager")
			}

			// Developers Note:
			// Our gateway supports registrations with authentication. We will need change verbage below at a later point.

			fmt.Printf("\nStarting OAuth 2.0 Authentication Process\n")
			fmt.Printf("----------------------------------------\n")
			fmt.Printf("This application uses OAuth 2.0's Authorization Code flow for secure authentication.\n")
			fmt.Printf("You'll be redirected to our secure registration page where you can safely enter your account details.\n")
			fmt.Printf("This ensures your password is never handled directly by this application.\n\n")

			fmt.Printf("Initializing registration + authentication request...\n")
			registrationURLResponse, err := oauthClientManager.GetRegistrationURL(ctx)
			if err != nil {
				fmt.Printf("\nAuthentication Error\n")
				fmt.Printf("-------------------\n")
				fmt.Printf("Failed to initialize registration process: %v\n", err)
				fmt.Printf("If this error persists, please contact support.\n")
				log.Fatal("Get registration URL: initialization failed")
			}
			if registrationURLResponse == nil {
				fmt.Printf("\nSystem Error\n")
				fmt.Printf("------------\n")
				fmt.Printf("Received empty response from authentication server.\n")
				fmt.Printf("Please try again later or contact support if the issue persists.\n")
				log.Fatal("Get registration URL: Empty login response")
			}

			fmt.Printf("\nregistration + Authentication Required\n")
			fmt.Printf("----------------------\n")
			fmt.Printf("Please copy the following URL into your browser and follow the instructions on page:\n%s\n", registrationURLResponse.RegistrationURL)

		},
	}

	return cmd
}
